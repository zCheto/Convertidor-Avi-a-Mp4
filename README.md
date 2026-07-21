# Convertidor AVI a MP4 (By Kiev)

Aplicación web moderna y ultrarrápida para la conversión de archivos de video `.AVI` a formato universal `.MP4` (H.264/AAC), optimizada para dispositivos móviles Android, iOS y computadoras.

---

## Características Principales

- **Recodificación H.264 / AAC:** Convierte videos `.AVI` a formato `.MP4` universalmente compatible con Android, iPhone, Smart TV y cualquier reproductor moderno.
- **Arquitectura Streaming I/O:** Transmisión continua por bloques de 64 KB para carga y descarga sin saturar la memoria RAM.
- **Blindaje de Seguridad y Multihilo:** Servidor multihilo (`ThreadingHTTPServer`), protección Anti-DDoS (Rate Limiter), sanitización de nombres de archivo y tiempo límite de conversión.
- **Compatibilidad Total con Celulares:** Los videos se guardan directamente en la galería del dispositivo sin descompresión de archivos `.ZIP`.
- **Procesamiento por Lotes:** Permite seleccionar y convertir múltiples archivos de forma secuencial.
- **Reproductor Integrado:** Reproduce el video o audio resultante para verificar la calidad antes de guardar.
- **Privacidad Total:** Los archivos se procesan temporalmente y no se almacenan de forma permanente.

---

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 Vanilla, JavaScript ES6+ (Aceleración por Hardware GPU).
- **Backend / Transcoding:** Python 3 (`ThreadingHTTPServer`), FFmpeg (`imageio-ffmpeg`).

---

## Acceso Directo Web

Puedes usar la versión online desplegada directamente en cualquier dispositivo:
🌐 **[https://convertidor-kiev.onrender.com](https://convertidor-kiev.onrender.com)**

---

## Instalación y Uso Local

### Requisitos Previos

- Python 3.8 o superior instalado en el sistema.

### Pasos de Ejecución

1. Clonar este repositorio o descargar los archivos del proyecto:
   ```bash
   git clone https://github.com/zCheto/Convertidor-Avi-a-Mp4.git
   cd Convertidor-Avi-a-Mp4
   ```

2. Instalar las dependencias requeridas:
   ```bash
   pip install -r requirements.txt
   ```

3. Iniciar el servidor local:
   ```bash
   python server.py
   ```

4. Abrir el navegador e ingresar a:
   `http://localhost:8080`

---

## Autor

Proyecto diseñado y desarrollado por **By Kiev**.
