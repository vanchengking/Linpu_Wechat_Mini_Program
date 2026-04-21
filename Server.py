import os
import uuid
import requests
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 引入阿里云 SDK (只用来做语音合成)
from dashscope.audio.tts import SpeechSynthesizer
import dashscope

# ================= 配置区域 (请修改这里) =================

# 1. 填入你截图里获取的 Dify Key (app-...)
DIFY_API_KEY = "app-QPNOOiIVckGN4D75ZQUkIWTS"

# 2. 填入阿里云 Key (sk-...) 用于语音合成
dashscope.api_key = "sk-7f1a7826e0ed482cadaedc8e2aabd5c7"

# 3. Dify 的地址
# 如果你用的是 Dify 官网 (dify.ai)，请用下面这个地址：
DIFY_API_URL = "https://api.dify.ai/v1/chat-messages"
# 如果你是本地部署的 Docker，请用： "https://api.dify.ai/v1/chat-messages"

# =======================================================

AUDIO_DIR = "temp_audio"
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "guest_user"  # 区分不同用户


# --- 核心函数 1: 问 Dify (大脑) ---
def call_dify_brain(query, user):
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": {},  # 如果你在 Dify 设置了变量，填在这里
        "query": query,  # 用户的问题
        "response_mode": "blocking",  # 等待全部生成完再返回
        "conversation_id": "",  # 如果想以此对话，可以存下这个ID
        "user": user,
    }

    try:
        response = requests.post(DIFY_API_URL, headers=headers, json=payload)
        response.raise_for_status()

        # 解析 Dify 返回的 JSON
        result = response.json()
        # Dify 的回答在 'answer' 字段里
        return result.get("answer", "（神明沉默了...）")

    except Exception as e:
        print(f"Dify Error: {e}")
        return "本世子现在听不清你在说什么（连接错误）。"


# --- 核心函数 2: 喊阿里云 (嘴巴) ---
def call_dashscope_tts(text):
    try:
        filename = f"voice_{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)

        # 使用 CosyVoice 模型
        synthesizer = SpeechSynthesizer(
            model='cosyvoice-v1',
            voice='longxiaochun',  # 这里以后可以换成更像男人的声音
            format='mp3'
        )

        audio = synthesizer.call(text)

        if synthesizer.get_last_request_id() is not None:
            with open(filepath, 'wb') as f:
                f.write(audio)
            return f"/audio/{filename}"
        else:
            return None
    except Exception as e:
        print(f"TTS Error: {e}")
        return None


# ================= 接口 =================

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"收到提问: {req.message}")

    # 1. 把问题发给 Dify (它会查知识库)
    ai_text = call_dify_brain(req.message, req.user_id)
    print(f"Dify回复: {ai_text}")

    # 2. 把 Dify 的回答转成语音
    audio_url = call_dashscope_tts(ai_text)

    # 3. 返回给前端
    return {
        "text": ai_text,
        "audio_url": audio_url
    }


@app.get("/audio/{filename}")
async def get_audio_file(filename: str):
    return FileResponse(os.path.join(AUDIO_DIR, filename))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8024)