#!/usr/bin/env python3
import argparse
import json
import os
import socket
import subprocess
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


APP_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share")) / "facturador-bocatinho"
DATA_FILE = DATA_DIR / "data.json"


def read_state():
    if not DATA_FILE.exists():
        return {}
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        backup = DATA_FILE.with_suffix(".json.corrupt")
        DATA_FILE.replace(backup)
        return {}


def write_state(payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_file = DATA_FILE.with_suffix(".json.tmp")
    tmp_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp_file.replace(DATA_FILE)


class FacturadorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path == "/api/state":
            payload = json.dumps(read_state(), ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/state":
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return

        write_state(payload)
        response = b'{"ok": true}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def open_browser(port):
    subprocess.Popen(
        ["google-chrome", f"--app=http://127.0.0.1:{port}/index.html"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main():
    parser = argparse.ArgumentParser(description="Facturador local Bocatinho")
    parser.add_argument("--no-browser", action="store_true")
    parser.add_argument("--port", type=int, default=0)
    args = parser.parse_args()

    port = args.port or free_port()
    server = ThreadingHTTPServer(("127.0.0.1", port), FacturadorHandler)
    if not args.no_browser:
        threading.Timer(0.4, open_browser, args=[port]).start()
    print(f"Facturador listo en http://127.0.0.1:{port}/index.html")
    print(f"Datos: {DATA_FILE}")
    server.serve_forever()


if __name__ == "__main__":
    main()
