BLACKSPIRE WEBSITE — FORM STORAGE BUILD

Changes:
- Ventures directory now shows "Ghost Model Studio" instead of "GODZ".
- Contact form sends submissions to the Python API.
- Every successful contact enquiry is stored in data/blackspire-data.xlsx (Enquiries sheet).
- Login email records are stored in the same workbook (Logins sheet); passwords are never stored.
- Form only shows success after the server confirms the save.

LOCAL TEST:
1. Install Python 3.
2. Run: pip install -r requirements.txt
3. Run: python server.py
4. Open http://localhost:3000
5. Workbook: data/blackspire-data.xlsx

LIVE HOSTING:
This build needs a Python web service with a persistent disk because the Excel workbook must survive redeploys.
Use the included render.yaml to deploy on Render. Do not deploy this build as a static-only Vercel site:
Vercel static hosting does not run server.py or persist a local Excel workbook.
On Render, the persistent disk is mounted at /var/data and DATA_DIR points there.

Privacy: passwords are never saved. Contact name, email, topic, venture and message are saved for responding to enquiries.
