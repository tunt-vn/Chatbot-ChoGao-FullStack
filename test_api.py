import requests
import json

url = "http://127.0.0.1:8000/chat"
payload = {
    "message": "Hello again",
    "user_id": "test_user",
    "session_id": "test_session"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
