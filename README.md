# Convertidor AVI a MP4 (By Kiev)

Aplicación web moderna y ultrarrápida para la conversión de archivos de video `.AVI` a formato universal `.MP4` (H.264/AAC), optimizada para dispositivos móviles Android, iOS y computadoras.

---

## 🌐 Acceso a la Aplicación Web

Puedes usar el convertidor online directamente desde tu navegador sin instalar nada:

👉 **[https://convertidor-kiev.onrender.com](https://convertidor-kiev.onrender.com)**

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

## Autor

Proyecto diseñado y desarrollado por **By Kiev**.
