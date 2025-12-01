import os, json
from firebase_admin import credentials, firestore, initialize_app

CRED = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
DATA = "sample_data/sample_tkb.json"

cred = credentials.Certificate(CRED)
try:
    initialize_app(cred)
except ValueError:
    pass
db = firestore.client()

with open(DATA, "r", encoding="utf-8") as f:
    payload = json.load(f)

# Seed timetables_by_class
for item in payload.get("timetables_by_class", []):
    doc_id = item["id"]
    db.collection("timetables_by_class").document(doc_id).set(item, merge=True)
    print("Seeded:", "timetables_by_class", doc_id)

# Seed timetables_by_teacher
for item in payload.get("timetables_by_teacher", []):
    doc_id = item["id"]
    db.collection("timetables_by_teacher").document(doc_id).set(item, merge=True)
    print("Seeded:", "timetables_by_teacher", doc_id)

print("✅ Done")
