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

class MobileConverterHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/convert':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                content_type = self.headers.get('Content-Type', '')
                body = self.rfile.read(content_length)

                if 'boundary=' not in content_type:
                    self.send_error(400, "No boundary")
                    return

                boundary = content_type.split('boundary=')[1].strip().encode()
                parts = body.split(b'--' + boundary)

                file_bytes = None
                file_name = "video.avi"

                for part in parts:
                    if b'filename=' in part:
                        headers_part, file_data = part.split(b'\r\n\r\n', 1)
                        file_bytes = file_data.rsplit(b'\r\n', 1)[0]
                        fn_match = re.search(rb'filename="([^"]+)"', headers_part)
                        if fn_match:
                            file_name = fn_match.group(1).decode('utf-8', 'ignore')
                        break

                if not file_bytes:
                    self.send_error(400, "No file uploaded")
                    return

                print(f"[Móvil] Recibido: {file_name} ({len(file_bytes)/(1024*1024):.2f} MB)...")

                with tempfile.TemporaryDirectory() as tmpdir:
                    in_path = os.path.join(tmpdir, "input.avi")
                    out_path = os.path.join(tmpdir, "output.mp4")

                    with open(in_path, "wb") as f:
                        f.write(file_bytes)

                    cmd = [
                        FFMPEG_EXE, "-y", "-err_detect", "ignore_err",
                        "-i", in_path,
                        "-c:v", "libx264", "-preset", "ultrafast",
                        "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k",
                        out_path
                    ]

                    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

                    if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                        with open(out_path, "rb") as f:
                            converted_bytes = f.read()

                        self.send_response(200)
                        self.send_header('Content-Type', 'video/mp4')
                        self.send_header('Content-Disposition', f'attachment; filename="{os.path.splitext(file_name)[0]}.mp4"')
                        self.send_header('Content-Length', str(len(converted_bytes)))
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(converted_bytes)
                        print("  ✅ MP4 H.264 enviado al celular.")
                    else:
                        self.send_error(500, "Error en conversión")
            except Exception as e:
                print(f"Error: {e}")
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not Found")

if __name__ == "__main__":
    os.chdir(r"C:\Users\PC\.gemini\antigravity-ide\scratch\avi-to-mp4-converter")
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, MobileConverterHandler)
    print(f"🚀 Servidor Móvil Activo en http://localhost:{PORT}")
    httpd.serve_forever()
