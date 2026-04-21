import os
import glob

# 1. 替换小程序页面里的 BASE_URL
js_files = glob.glob('pages/**/*.js', recursive=True)
count_js = 0
for f in js_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'http://112.126.80.115:8024' in content:
        content = content.replace('http://112.126.80.115:8024', 'http://127.0.0.1:8024')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        count_js += 1
print(f"成功修改了 {count_js} 个小程序的 JS 文件。")

# 2. 替换 Server.py 里的 Dify 接口地址
with open('Server.py', 'r', encoding='utf-8') as file:
    content = file.read()
if 'http://localhost/v1/chat-messages' in content:
    content = content.replace('http://localhost/v1/chat-messages', 'https://api.dify.ai/v1/chat-messages')
    with open('Server.py', 'w', encoding='utf-8') as file:
        file.write(content)
    print("成功修改了 Server.py 中的 Dify 地址为官网地址。")
