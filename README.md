# Convertidor AVI a MP4 (By Kiev)

Aplicacion web moderna y ultrarrapida para la conversion de archivos de video `.AVI` a formato universal `.MP4` (H.264/AAC), optimizada para dispositivos moviles Android, iOS y computadoras.

---

## Características Principales

- **Recodificación H.264 / AAC:** Convierte videos `.AVI` a formato `.MP4` universalmente compatible con Android, iPhone, Smart TV y cualquier reproductor moderno, eliminando errores de códec.
- **Compatibilidad Total con Celulares:** Los videos convertidos se guardan directamente en la galería del dispositivo sin necesidad de aplicaciones adicionales ni descompresión de archivos `.ZIP`.
- **Procesamiento por Lotes:** Permite seleccionar y convertir múltiples archivos `.AVI` de forma simultánea en una sola sesión.
- **Reproductor de Verificación Integrado:** Reproduce el video convertido directamente en la pantalla de resultados para confirmar la calidad antes de guardarlo.
- **Sin Instalación para el Usuario Final:** Funciona completamente desde el navegador web del celular, sin necesidad de descargar ni instalar ninguna aplicación.
- **Privacidad Total:** Los archivos se procesan localmente en el servidor y no se almacenan ni envían a servicios externos.

---

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 Vanilla, JavaScript ES6+.
- **Backend / Transcoding:** Python 3 (HTTP Server), FFmpeg (H.264 / AAC Encoding).

---

## Instalación y Uso Local

### Requisitos Previos

- Python 3.8 o superior instalado en el sistema.

### Pasos de Ejecución

1. Clonar este repositorio o descargar los archivos del proyecto.
2. Abrir la terminal o consola de comandos en la carpeta del proyecto.
3. Iniciar el servidor de conversión ejecutando:
   ```bash
   python server.py
   ```
4. Abrir el navegador web e ingresar a:
   - Desde la misma computadora: `http://localhost:8080`
   - Desde un celular en la misma red Wi-Fi: `http://<TU_IP_LOCAL>:8080` (ejemplo: `http://192.168.1.12:8080`).

---

## Autor

Proyecto diseñado y desarrollado por **By Kiev**.
