"""Blackspire server: serves the website AND saves form data to Excel.

Run:   pip install openpyxl   then   python server.py   ->  http://localhost:3000
Data file: data/blackspire-data.xlsx
  - "Enquiries": every contact-form submission
  - "Logins":    every email used to enter the site (passwords are never stored)
"""
import json
import os
import re
import threading
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font

PORT = int(os.environ.get("PORT", 3000))
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(ROOT, "data"))
XLSX = os.path.join(DATA_DIR, "blackspire-data.xlsx")

SHEETS = {
    "Enquiries": (["Received at", "Name", "Email", "Topic", "Venture", "Message"], [22, 22, 30, 22, 24, 70]),
    "Logins": (["Logged in at", "Email"], [22, 36]),
}
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PUBLIC = (".html", ".css", ".js", ".csv", ".svg", ".png", ".xml", ".txt")
lock = threading.Lock()


def now():
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S") + " IST"


def clean(value, limit):
    s = str(value if value is not None else "").strip()[:limit]
    # stop spreadsheet formula injection
    return "'" + s if s[:1] in ("=", "+", "-", "@", "\t", "\r") else s


def save_row(sheet, values):
    with lock:
        os.makedirs(os.path.dirname(XLSX), exist_ok=True)
        wb = load_workbook(XLSX) if os.path.exists(XLSX) else Workbook()
        if "Sheet" in wb.sheetnames and len(wb.sheetnames) == 1:
            del wb["Sheet"]
        for name, (headers, widths) in SHEETS.items():
            if name in wb.sheetnames:
                continue
            ws = wb.create_sheet(name)
            ws.append(headers)
            for cell in ws[1]:
                cell.font = Font(bold=True)
            for i, w in enumerate(widths):
                ws.column_dimensions[chr(65 + i)].width = w
            ws.freeze_panes = "A2"
        wb[sheet].append(values)
        tmp = XLSX + ".tmp"
        wb.save(tmp)
        os.replace(tmp, XLSX)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def reply(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        path = self.path.split("?")[0]
        if path not in ("/api/login", "/api/contact"):
            return self.reply(404, {"error": "Not found"})
        try:
            size = int(self.headers.get("Content-Length", 0))
            if size > 20000:
                return self.reply(413, {"error": "Too large"})
            d = json.loads(self.rfile.read(size) or b"{}")
            email = clean(d.get("email"), 120)
            if not EMAIL.match(email):
                return self.reply(400, {"error": "Valid email required"})
            if path == "/api/login":
                save_row("Logins", [now(), email])
            else:
                name, topic, msg = clean(d.get("name"), 80), clean(d.get("topic"), 60), clean(d.get("message"), 1200)
                if not (name and topic and msg):
                    return self.reply(400, {"error": "Missing fields"})
                save_row("Enquiries", [now(), name, email, topic, clean(d.get("venture_id"), 60), msg])
            self.reply(200, {"ok": True})
        except Exception as e:  # noqa: BLE001
            print("Save failed:", e)
            self.reply(500, {"error": "Could not save"})

    def allowed(self):
        p = self.path.split("?")[0].split("#")[0]
        return p == "/" or p.lower().endswith(PUBLIC)

    def not_found(self):
        body = open(os.path.join(ROOT, "404.html"), "rb").read()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/health":
            return self.reply(200, {"ok": True, "service": "Blackspire forms"})
        if self.allowed():
            super().do_GET()
        else:
            self.not_found()

    def do_HEAD(self):
        if self.allowed():
            super().do_HEAD()
        else:
            self.not_found()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    print(f"Blackspire running at http://localhost:{PORT}\nData is saved to {XLSX}")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
