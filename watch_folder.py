import os
import sys
import time
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_DIR = r"C:\Users\PC\.gemini\antigravity-ide\scratch\avi-to-mp4-converter"

def get_dir_mtime(folder):
    max_mtime = 0
    for root, dirs, files in os.walk(folder):
        if '.git' in root:
            continue
        for f in files:
            filepath = os.path.join(root, f)
            try:
                mtime = os.path.getmtime(filepath)
                if mtime > max_mtime:
                    max_mtime = mtime
            except OSError:
                pass
    return max_mtime

def start_watching():
    print(f"🚀 Vigilante de Sincronizacion Automatica a GitHub Activo en: {PROJECT_DIR}")
    last_mtime = get_dir_mtime(PROJECT_DIR)

    while True:
        time.sleep(2)
        current_mtime = get_dir_mtime(PROJECT_DIR)

        if current_mtime > last_mtime:
            last_mtime = current_mtime
            print("\n[Auto-Sync GitHub] Se detecto un cambio en los archivos. Sincronizando a GitHub...")

            try:
                subprocess.run(["git", "add", "."], cwd=PROJECT_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(["git", "commit", "-m", "Auto-sync: cambio guardado automaticamente"], cwd=PROJECT_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(["git", "push", "origin", "master"], cwd=PROJECT_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print("  ✅ Cambios subidos a tu GitHub automaticamente en segundo plano (sin tocar nada).")
            except Exception as e:
                print(f"  ❌ Error en sincronizacion: {e}")

if __name__ == "__main__":
    start_watching()
