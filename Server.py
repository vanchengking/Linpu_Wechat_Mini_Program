import os
import time
import uuid
from contextlib import contextmanager
from typing import Optional

import pymysql
import requests
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    from dashscope.audio.tts import SpeechSynthesizer
    import dashscope
except ImportError:  # pragma: no cover
    SpeechSynthesizer = None
    dashscope = None

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None


if load_dotenv:
    load_dotenv()


DIFY_API_KEY = os.getenv("DIFY_API_KEY", "app-QPNOOiIVckGN4D75ZQUkIWTS")
DIFY_API_URL = os.getenv("DIFY_API_URL", "https://api.dify.ai/v1/chat-messages")
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "sk-7f1a7826e0ed482cadaedc8e2aabd5c7")

WECHAT_APP_ID = os.getenv("WECHAT_APP_ID", "wx442934a532a838d5")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET", "68e6be1e35599db1a5339c50c7dbe606")
WECHAT_ACCESS_TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token"
WECHAT_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session"
WECHAT_PHONE_URL = "https://api.weixin.qq.com/wxa/business/getuserphonenumber"

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "linpu_user")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "jWbsGmrByjiXikWd")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "linpu_wechat")

SERVER_PUBLIC_BASE = os.getenv("SERVER_PUBLIC_BASE", "https://bl.meishipay.com").rstrip("/")
SESSION_EXPIRE_DAYS = int(os.getenv("SESSION_EXPIRE_DAYS", "30"))

AUDIO_DIR = "temp_audio"
UPLOAD_ROOT = "uploads"
AVATAR_DIR = os.path.join(UPLOAD_ROOT, "avatars")

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(AVATAR_DIR, exist_ok=True)

if dashscope and DASHSCOPE_API_KEY:
    dashscope.api_key = DASHSCOPE_API_KEY


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")


_wechat_access_token_cache = {
    "value": None,
    "expires_at": 0,
}


def db_ready() -> bool:
    return all([MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE])


@contextmanager
def db_connection():
    if not db_ready():
        raise RuntimeError("MySQL is not configured")

    conn = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def ensure_tables():
    if not db_ready():
        print("MySQL config missing, profile APIs will be unavailable.")
        return

    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS user_profiles (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    openid VARCHAR(64) NOT NULL UNIQUE,
                    unionid VARCHAR(64) NULL,
                    nickname VARCHAR(64) NOT NULL DEFAULT '林浦游客',
                    avatar_url VARCHAR(512) NOT NULL DEFAULT '/resources/icons/个人.png',
                    phone_number VARCHAR(32) NULL,
                    points INT NOT NULL DEFAULT 0,
                    total_exp INT NOT NULL DEFAULT 0,
                    landmark_visited INT NOT NULL DEFAULT 0,
                    experience_done INT NOT NULL DEFAULT 0,
                    ar_scanned INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    user_id BIGINT NOT NULL,
                    session_token VARCHAR(128) NOT NULL UNIQUE,
                    expires_at DATETIME NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """
            )


@app.on_event("startup")
def startup_event():
    ensure_tables()


class ChatRequest(BaseModel):
    message: str
    user_id: str = "guest_user"


class WechatLoginRequest(BaseModel):
    code: str = Field(..., min_length=1)


class ProfileSyncRequest(BaseModel):
    points: Optional[int] = None
    totalExp: Optional[int] = None
    landmarkVisited: Optional[int] = None
    experienceDone: Optional[int] = None
    arScanned: Optional[int] = None


class NicknameUpdateRequest(BaseModel):
    nickname: str = Field(..., min_length=1, max_length=20)


class PhoneBindRequest(BaseModel):
    code: str = Field(..., min_length=1)


def require_mysql():
    if not db_ready():
        raise HTTPException(status_code=500, detail="MySQL not configured on server")


def require_wechat_credentials():
    if not WECHAT_APP_ID or not WECHAT_APP_SECRET:
        raise HTTPException(status_code=500, detail="WeChat AppID/AppSecret not configured")


def build_level(total_exp: int) -> dict:
    level = min(10, total_exp // 200 + 1)
    titles = {
        1: "初来乍到",
        2: "好奇游客",
        3: "文化学徒",
        4: "林浦过客",
        5: "文化行者",
        6: "古迹守护者",
        7: "历史探寻者",
        8: "林浦通",
        9: "文化大使",
        10: "传奇探险者",
    }
    return {
        "level": level,
        "levelTitle": titles.get(level, "传奇探险者"),
    }


def mask_phone(phone_number: Optional[str]) -> str:
    if not phone_number:
        return ""
    if len(phone_number) < 7:
        return phone_number
    return f"{phone_number[:3]}****{phone_number[-4:]}"


def serialize_profile(row: dict) -> dict:
    level_info = build_level(row.get("total_exp", 0))
    return {
        "id": row["id"],
        "openid": row["openid"],
        "nickname": row.get("nickname") or "林浦游客",
        "avatarUrl": row.get("avatar_url") or "/resources/icons/个人.png",
        "phone": row.get("phone_number") or "",
        "phoneMasked": mask_phone(row.get("phone_number")),
        "points": row.get("points", 0),
        "totalExp": row.get("total_exp", 0),
        "stats": {
            "landmarkVisited": row.get("landmark_visited", 0),
            "experienceDone": row.get("experience_done", 0),
            "arScanned": row.get("ar_scanned", 0),
        },
        **level_info,
    }


def get_user_by_openid(openid: str) -> Optional[dict]:
    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user_profiles WHERE openid = %s LIMIT 1", (openid,))
            return cursor.fetchone()


def get_user_by_id(user_id: int) -> Optional[dict]:
    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user_profiles WHERE id = %s LIMIT 1", (user_id,))
            return cursor.fetchone()


def create_or_update_user(openid: str, unionid: Optional[str] = None) -> dict:
    default_nickname = f"林浦游客{openid[-4:]}" if openid else "林浦游客"
    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user_profiles WHERE openid = %s LIMIT 1", (openid,))
            user = cursor.fetchone()
            if user:
                if unionid and not user.get("unionid"):
                    cursor.execute(
                        "UPDATE user_profiles SET unionid = %s WHERE id = %s",
                        (unionid, user["id"]),
                    )
                cursor.execute("SELECT * FROM user_profiles WHERE id = %s", (user["id"],))
                return cursor.fetchone()

            cursor.execute(
                """
                INSERT INTO user_profiles (
                    openid,
                    unionid,
                    nickname,
                    avatar_url
                ) VALUES (%s, %s, %s, %s)
                """,
                (openid, unionid, default_nickname, "/resources/icons/个人.png"),
            )
            user_id = cursor.lastrowid
            cursor.execute("SELECT * FROM user_profiles WHERE id = %s", (user_id,))
            return cursor.fetchone()


def create_session(user_id: int) -> str:
    token = uuid.uuid4().hex
    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM user_sessions WHERE user_id = %s", (user_id,))
            cursor.execute(
                """
                INSERT INTO user_sessions (user_id, session_token, expires_at)
                VALUES (%s, %s, DATE_ADD(NOW(), INTERVAL %s DAY))
                """,
                (user_id, token, SESSION_EXPIRE_DAYS),
            )
    return token


def parse_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing session token")
    return authorization.replace("Bearer ", "", 1).strip()


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    require_mysql()
    token = parse_bearer_token(authorization)

    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT p.*
                FROM user_sessions s
                JOIN user_profiles p ON p.id = s.user_id
                WHERE s.session_token = %s AND s.expires_at > NOW()
                LIMIT 1
                """,
                (token,),
            )
            user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    return user


def get_wechat_access_token() -> str:
    require_wechat_credentials()
    now = int(time.time())
    cached_token = _wechat_access_token_cache.get("value")
    if cached_token and _wechat_access_token_cache.get("expires_at", 0) > now + 60:
        return cached_token

    response = requests.get(
        WECHAT_ACCESS_TOKEN_URL,
        params={
            "grant_type": "client_credential",
            "appid": WECHAT_APP_ID,
            "secret": WECHAT_APP_SECRET,
        },
        timeout=10,
    )
    response.raise_for_status()
    result = response.json()
    if result.get("errcode"):
        raise HTTPException(status_code=502, detail=f"WeChat access_token error: {result}")

    _wechat_access_token_cache["value"] = result["access_token"]
    _wechat_access_token_cache["expires_at"] = now + int(result.get("expires_in", 7200))
    return result["access_token"]


def exchange_wechat_login_code(code: str) -> dict:
    require_wechat_credentials()
    response = requests.get(
        WECHAT_LOGIN_URL,
        params={
            "appid": WECHAT_APP_ID,
            "secret": WECHAT_APP_SECRET,
            "js_code": code,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    response.raise_for_status()
    result = response.json()
    if result.get("errcode"):
        raise HTTPException(status_code=502, detail=f"WeChat login error: {result}")
    return result


def get_phone_number_by_code(code: str) -> str:
    access_token = get_wechat_access_token()
    response = requests.post(
        f"{WECHAT_PHONE_URL}?access_token={access_token}",
        json={"code": code},
        timeout=10,
    )
    response.raise_for_status()
    result = response.json()
    if result.get("errcode"):
        raise HTTPException(status_code=502, detail=f"WeChat phone bind error: {result}")

    phone_info = result.get("phone_info") or {}
    phone_number = phone_info.get("purePhoneNumber") or phone_info.get("phoneNumber")
    if not phone_number:
        raise HTTPException(status_code=502, detail="WeChat did not return a phone number")
    return phone_number


def update_user_fields(user_id: int, field_mapping: dict) -> dict:
    allowed_columns = {
        "nickname": "nickname",
        "avatarUrl": "avatar_url",
        "phone": "phone_number",
        "points": "points",
        "totalExp": "total_exp",
        "landmarkVisited": "landmark_visited",
        "experienceDone": "experience_done",
        "arScanned": "ar_scanned",
    }

    assignments = []
    values = []
    for key, value in field_mapping.items():
        column = allowed_columns.get(key)
        if column is None or value is None:
            continue
        assignments.append(f"{column} = %s")
        values.append(value)

    if assignments:
        with db_connection() as conn:
            with conn.cursor() as cursor:
                sql = f"UPDATE user_profiles SET {', '.join(assignments)} WHERE id = %s"
                cursor.execute(sql, (*values, user_id))

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def call_dify_brain(query: str, user: str) -> str:
    if not DIFY_API_KEY:
        return "聊天服务未配置 Dify Key。"

    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": {},
        "query": query,
        "response_mode": "blocking",
        "conversation_id": "",
        "user": user,
    }

    try:
        response = requests.post(DIFY_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result.get("answer", "暂时没有获取到回复。")
    except Exception as exc:  # pragma: no cover
        print(f"Dify Error: {exc}")
        return "尚书伯现在有点忙，请稍后再试。"


def call_dashscope_tts(text: str) -> Optional[str]:
    if not SpeechSynthesizer or not DASHSCOPE_API_KEY:
        return None

    try:
        filename = f"voice_{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        synthesizer = SpeechSynthesizer(
            model="cosyvoice-v1",
            voice="longxiaochun",
            format="mp3",
        )
        audio = synthesizer.call(text)
        if synthesizer.get_last_request_id() is not None:
            with open(filepath, "wb") as audio_file:
                audio_file.write(audio)
            return f"/audio/{filename}"
    except Exception as exc:  # pragma: no cover
        print(f"TTS Error: {exc}")
    return None


@app.get("/health")
async def health():
    return {
        "ok": True,
        "mysqlConfigured": db_ready(),
        "wechatConfigured": bool(WECHAT_APP_ID and WECHAT_APP_SECRET),
    }


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    ai_text = call_dify_brain(req.message, req.user_id)
    audio_url = call_dashscope_tts(ai_text)
    return {
        "text": ai_text,
        "audio_url": audio_url,
    }


@app.post("/api/auth/wechat-login")
async def wechat_login(req: WechatLoginRequest):
    require_mysql()
    login_data = exchange_wechat_login_code(req.code)
    openid = login_data.get("openid")
    unionid = login_data.get("unionid")
    if not openid:
        raise HTTPException(status_code=502, detail="WeChat login returned no openid")

    user = create_or_update_user(openid, unionid)
    token = create_session(user["id"])
    return {
        "token": token,
        "profile": serialize_profile(user),
    }


@app.get("/api/profile/me")
async def get_profile_me(current_user: dict = Depends(get_current_user)):
    latest_user = get_user_by_id(current_user["id"])
    return {
        "profile": serialize_profile(latest_user or current_user),
    }


@app.post("/api/profile/sync")
async def sync_profile(req: ProfileSyncRequest, current_user: dict = Depends(get_current_user)):
    updated_user = update_user_fields(
        current_user["id"],
        {
            "points": req.points,
            "totalExp": req.totalExp,
            "landmarkVisited": req.landmarkVisited,
            "experienceDone": req.experienceDone,
            "arScanned": req.arScanned,
        },
    )
    return {
        "profile": serialize_profile(updated_user),
    }


@app.post("/api/profile/nickname")
async def update_nickname(req: NicknameUpdateRequest, current_user: dict = Depends(get_current_user)):
    nickname = req.nickname.strip()
    if not nickname:
        raise HTTPException(status_code=400, detail="Nickname cannot be empty")

    updated_user = update_user_fields(current_user["id"], {"nickname": nickname})
    return {
        "profile": serialize_profile(updated_user),
    }


@app.post("/api/profile/phone/bind")
async def bind_phone(req: PhoneBindRequest, current_user: dict = Depends(get_current_user)):
    phone_number = get_phone_number_by_code(req.code)
    updated_user = update_user_fields(current_user["id"], {"phone": phone_number})
    return {
        "profile": serialize_profile(updated_user),
    }


@app.post("/api/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    suffix = os.path.splitext(file.filename or "")[1] or ".png"
    filename = f"user_{current_user['id']}_{uuid.uuid4().hex}{suffix}"
    save_path = os.path.join(AVATAR_DIR, filename)

    with open(save_path, "wb") as output_file:
        output_file.write(await file.read())

    avatar_url = f"{SERVER_PUBLIC_BASE}/uploads/avatars/{filename}"
    updated_user = update_user_fields(current_user["id"], {"avatarUrl": avatar_url})
    return {
        "profile": serialize_profile(updated_user),
    }


@app.get("/audio/{filename}")
async def get_audio_file(filename: str):
    filepath = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(filepath)


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8024)
