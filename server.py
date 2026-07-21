import os
import sys
import re
import time
import subprocess
import tempfile
from collections import defaultdict
from threading import Lock
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

sys.stdout.reconfigure(encoding='utf-8')

import imageio_ffmpeg
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
PORT = int(os.environ.get('PORT', 8080))
CHUNK_SIZE = 64 * 1024             # Buffer de 64 KB para Streaming
MAX_FILE_SIZE = 250 * 1024 * 1024  # Límite máximo de 250 MB por archivo (Error 413)

# ═══════════════════════════════════════════════════════════
# 🛡️ RATE LIMITING THREAD-SAFE (Max 10 peticiones / min por IP)
# ═══════════════════════════════════════════════════════════
RATE_LIMIT_LOCK = Lock()
IP_CONVERSIONS = defaultdict(list)
MAX_CONVERSIONS_PER_MINUTE = 10

def is_rate_limited(ip):
    now = time.time()
    with RATE_LIMIT_LOCK:
        # Filtrar registros de más de 60 segundos
        timestamps = [t for t in IP_CONVERSIONS[ip] if now - t < 60]
        if len(timestamps) >= MAX_CONVERSIONS_PER_MINUTE:
            return True
        timestamps.append(now)
        IP_CONVERSIONS[ip] = timestamps
        return False

def sanitize_filename(name):
    """
    Sanitiza el nombre del archivo dejando únicamente caracteres alfanuméricos,
    puntos, guiones y guiones bajos para prevenir Inyección de Cabeceras (Response Splitting).
    """
    if not name:
        return "video.avi"
    clean_name = os.path.basename(name)
    clean_name = re.sub(r'[^\w.-]', '_', clean_name)
    return clean_name if clean_name else "video.avi"

def parse_and_stream_upload(rfile, content_length, boundary_bytes, dest_file_path):
    """
    Procesa el multipart/form-data en streaming continuo (bloques de 64 KB)
    escribiendo los datos recibidos directamente al disco sin cargarlos completos en RAM.
    """
    boundary_marker = b'--' + boundary_bytes
    remaining = content_length
    buffer = b""
    raw_file_name = "video.avi"

    # 1. Leer hasta encontrar el final de las cabeceras multipart (\r\n\r\n)
    while b"\r\n\r\n" not in buffer and remaining > 0:
        to_read = min(CHUNK_SIZE, remaining)
        chunk = rfile.read(to_read)
        if not chunk:
            break
        buffer += chunk
        remaining -= len(chunk)

    if b"\r\n\r\n" not in buffer:
        raise ValueError("Cabeceras multipart inválidas")

    headers_part, buffer = buffer.split(b"\r\n\r\n", 1)

    # Extraer el nombre original del archivo si está presente
    fn_match = re.search(rb'filename="([^"]+)"', headers_part)
    if fn_match:
        try:
            raw_file_name = fn_match.group(1).decode('utf-8', 'ignore')
        except Exception:
            pass

    file_name = sanitize_filename(raw_file_name)

    # 2. Escribir los datos binarios directamente al archivo en bloques
    safe_buffer_len = len(boundary_marker) + 128
    with open(dest_file_path, "wb") as out_f:
        while True:
            idx = buffer.find(boundary_marker)
            if idx != -1:
                write_bytes = buffer[:idx]
                if write_bytes.endswith(b"\r\n"):
                    write_bytes = write_bytes[:-2]
                out_f.write(write_bytes)
                buffer = b""
                break

            if len(buffer) > safe_buffer_len:
                to_write = buffer[:-safe_buffer_len]
                out_f.write(to_write)
                buffer = buffer[-safe_buffer_len:]

            if remaining <= 0:
                out_f.write(buffer)
                buffer = b""
                break

            to_read = min(CHUNK_SIZE, remaining)
            chunk = rfile.read(to_read)
            if not chunk:
                break
            buffer += chunk
            remaining -= len(chunk)

    # Drenar el resto de la petición si quedan bytes sobrantes
    while remaining > 0:
        to_read = min(CHUNK_SIZE, remaining)
        c = rfile.read(to_read)
        if not c:
            break
        remaining -= len(c)

    return file_name


class MobileConverterHandler(SimpleHTTPRequestHandler):
    FORBIDDEN_EXTENSIONS = ('.py', '.git', '.env', '.bat', '.sh', '.json', '.yml', '.yaml')
    FORBIDDEN_FILES = ('requirements.txt', 'Dockerfile', 'README.md', 'auto_sync.bat', 'watch_folder.py')

    def end_headers(self):
        # 🔏 Cabeceras de seguridad HTTP globales
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        super().end_headers()

    def do_GET(self):
        # 🔒 Protección Anti-Path Traversal y Ocultamiento de Código Fuente
        clean_path = os.path.normpath(self.path.split('?')[0]).lstrip('/')
        
        if '..' in clean_path:
            self.send_error(403, "Forbidden: Navegacion invalida")
            return

        base_file = os.path.basename(clean_path).lower()
        if clean_path.endswith(self.FORBIDDEN_EXTENSIONS) or base_file in self.FORBIDDEN_FILES:
            self.send_error(403, "Forbidden: Acceso no autorizado a archivos del servidor")
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/convert':
            try:
                client_ip = self.client_address[0]

                # 🛡️ 1. Protección Anti-DDoS / Rate Limiting (Error 429)
                if is_rate_limited(client_ip):
                    print(f"  ❌ Bloqueado Anti-DDoS (Error 429): IP {client_ip} excedió 10 peticiones/min.")
                    self.send_error(429, "Too Many Requests: Has excedido el limite de conversiones (10 por minuto).")
                    return

                content_length = int(self.headers.get('Content-Length', 0))
                content_type = self.headers.get('Content-Type', '')

                # 🛑 2. Rechazar peticiones que excedan el límite máximo de tamaño (Error 413)
                if content_length > MAX_FILE_SIZE:
                    max_mb = MAX_FILE_SIZE // (1024 * 1024)
                    print(f"  ❌ Rechazado (Error 413): Archivo de {content_length / (1024*1024):.1f} MB excede el límite de {max_mb} MB.")
                    self.send_error(413, f"Payload Too Large: El archivo excede el limite maximo de {max_mb} MB")
                    return

                if 'boundary=' not in content_type:
                    self.send_error(400, "No boundary found in Content-Type")
                    return

                boundary_bytes = content_type.split('boundary=')[1].strip().encode()

                with tempfile.TemporaryDirectory() as tmpdir:
                    in_path = os.path.join(tmpdir, "input.avi")
                    out_path = os.path.join(tmpdir, "output.mp4")

                    # Recepción en Streaming (escribe a disco en bloques de 64 KB)
                    file_name = parse_and_stream_upload(self.rfile, content_length, boundary_bytes, in_path)
                    uploaded_mb = os.path.getsize(in_path) / (1024 * 1024)
                    print(f"[Streaming Mode] Recibido: {file_name} ({uploaded_mb:.2f} MB) de IP {client_ip}...")

                    # ⚡ 3. Conversión mediante FFmpeg con Timeout (300 s)
                    cmd = [
                        FFMPEG_EXE, "-y", "-err_detect", "ignore_err",
                        "-i", in_path,
                        "-c:v", "libx264", "-preset", "ultrafast",
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k",
                        out_path
                    ]

                    try:
                        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=300)
                    except subprocess.TimeoutExpired:
                        print(f"  ❌ Timeout (Error 504): Conversión de {file_name} cancelada tras 300 segundos.")
                        self.send_error(504, "Gateway Timeout: La conversion excedio el tiempo limite de 300 segundos.")
                        return

                    # 🛡️ 4. Envío del resultado sanitizado en Streaming
                    if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                        file_size = os.path.getsize(out_path)
                        base_clean = sanitize_filename(os.path.splitext(file_name)[0])
                        out_name = f"{base_clean}.mp4"

                        self.send_response(200)
                        self.send_header('Content-Type', 'video/mp4')
                        self.send_header('Content-Disposition', f'attachment; filename="{out_name}"')
                        self.send_header('Content-Length', str(file_size))
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()

                        with open(out_path, "rb") as f:
                            while True:
                                chunk = f.read(CHUNK_SIZE)
                                if not chunk:
                                    break
                                self.wfile.write(chunk)

                        print(f"  ✅ Video {out_name} enviado en streaming continuo a IP {client_ip}.")
                    else:
                        self.send_error(500, "Error en conversión de video")
            except Exception as e:
                print(f"Error en servidor: {e}")
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not Found")

    # 🚫 Bloqueo de Métodos HTTP Peligrosos (Error 405)
    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")

    def do_PATCH(self):
        self.send_error(405, "Method Not Allowed")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', PORT)
    httpd = ThreadingHTTPServer(server_address, MobileConverterHandler)
    print(f"Servidor activo con Seguridad Avanzada Anti-DDoS y Streaming en puerto {PORT}")
    httpd.serve_forever()
