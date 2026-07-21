# Convertidor AVI a MP4 (By Kiev)

Aplicacion web moderna y ultrarrapida para la conversion de archivos de video `.AVI` a formato universal `.MP4` (H.264/AAC), optimizada para dispositivos moviles Android, iOS y computadoras.

---

## Características Principales

- **Recodificación H.264 / AAC:** Convierte videos antiguos `.AVI` a un formato 100% compatible con todos los reproductores de celulares Android y Apple sin errores de códec.
- **Diseño Cristal Acrílico (Glassmorphism):** Interfaz futurista basada en tarjetas translúcidas, efectos de desenfoque y tipografía nítida.
- **Animaciones a 60 FPS:** Motor de nieve de partículas interactivo en canvas, rastro de destellos al tocar la pantalla y animaciones de resorte.
- **Reproductor de Prueba Integrado:** Permite verificar la reproducción completa y la calidad del video antes de descargarlo.
- **Descargas Directas a Galería:** Sin necesidad de descomprimir archivos `.ZIP` en dispositivos móviles.
- **Procesamiento por Lotes:** Permite cargar y convertir múltiples archivos de video simultáneamente.

---

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 Vanilla (Glassmorphic System), JavaScript ES6+ (Canvas Particle Engine).
- **Backend / Transcoding:** Python 3 (HTTP Server), FFmpeg CLI (H.264 / AAC Encoding).

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
