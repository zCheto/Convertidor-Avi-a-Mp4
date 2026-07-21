import os
import sys
import re
import subprocess
import tempfile
from http.server import HTTPServer, SimpleHTTPRequestHandler

sys.stdout.reconfigure(encoding='utf-8')

import imageio_ffmpeg
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
PORT = int(os.environ.get('PORT', 8080))
CHUNK_SIZE = 64 * 1024  # 64 KB buffer para streaming sin saturar RAM

def parse_and_stream_upload(rfile, content_length, boundary_bytes, dest_file_path):
    """
    Procesa el multipart/form-data en streaming continuo (bloques de 64 KB)
    escribiendo los datos recibidos directamente al disco sin cargarlos completos en RAM.
    """
    boundary_marker = b'--' + boundary_bytes
    remaining = content_length
    buffer = b""
    file_name = "video.avi"

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
            file_name = fn_match.group(1).decode('utf-8', 'ignore')
        except Exception:
            pass

    # 2. Escribir los datos binarios directamente al archivo en bloques
    safe_buffer_len = len(boundary_marker) + 128
    with open(dest_file_path, "wb") as out_f:
        while True:
            idx = buffer.find(boundary_marker)
            if idx != -1:
                # Se encontró el límite del archivo
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
    def do_POST(self):
        if self.path == '/api/convert':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                content_type = self.headers.get('Content-Type', '')

                if 'boundary=' not in content_type:
                    self.send_error(400, "No boundary found in Content-Type")
                    return

                boundary_bytes = content_type.split('boundary=')[1].strip().encode()

                with tempfile.TemporaryDirectory() as tmpdir:
                    in_path = os.path.join(tmpdir, "input.avi")
                    out_path = os.path.join(tmpdir, "output.mp4")

                    # 1. Recepción en Streaming (escribe a disco en bloques de 64 KB)
                    file_name = parse_and_stream_upload(self.rfile, content_length, boundary_bytes, in_path)
                    uploaded_mb = os.path.getsize(in_path) / (1024 * 1024)
                    print(f"[Streaming Mode] Recibido: {file_name} ({uploaded_mb:.2f} MB)...")

                    # 2. Conversión mediante FFmpeg
                    cmd = [
                        FFMPEG_EXE, "-y", "-err_detect", "ignore_err",
                        "-i", in_path,
                        "-c:v", "libx264", "-preset", "ultrafast",
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k",
                        out_path
                    ]

                    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

                    # 3. Envío del resultado en Streaming (bloques de 64 KB sin cargar en RAM)
                    if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                        file_size = os.path.getsize(out_path)
                        out_name = f"{os.path.splitext(file_name)[0]}.mp4"

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

                        print(f"  ✅ Video {out_name} enviado en streaming continuo.")
                    else:
                        self.send_error(500, "Error en conversión de video")
            except Exception as e:
                print(f"Error en servidor: {e}")
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not Found")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, MobileConverterHandler)
    print(f"Servidor activo con Streaming I/O en puerto {PORT}")
    httpd.serve_forever()
