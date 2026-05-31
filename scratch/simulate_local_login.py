# scratch/simulate_local_login.py
import sys
import os
import time
import hashlib
import random
import xml.etree.ElementTree as ET
import httpx

# 将项目根目录添加到系统路径，以便可以导入 backend 模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.database import SessionLocal
from backend.models import models

def simulate():
    db = SessionLocal()
    
    # 确保数据库中有测试 token
    test_token = "xiaoxiao_2026"
    config = db.query(models.SystemConfig).filter(models.SystemConfig.config_key == "WECHAT_TOKEN").first()
    if config:
        config.config_value = test_token
    else:
        config = models.SystemConfig(
            config_key="WECHAT_TOKEN",
            config_value=test_token,
            description="微信回调 Token"
        )
        db.add(config)
    db.commit()
    
    # 清理历史测试数据
    test_openid = "local_test_user_888"
    db.query(models.User).filter(models.User.wechat_openid == test_openid).delete()
    db.query(models.WechatLoginCode).filter(models.WechatLoginCode.wechat_openid == test_openid).delete()
    db.commit()
    
    # 签名计算
    timestamp = str(int(time.time()))
    nonce = str(random.randint(1000, 9999))
    tmp_list = sorted([test_token, timestamp, nonce])
    tmp_str = "".join(tmp_list)
    signature = hashlib.sha1(tmp_str.encode("utf-8")).hexdigest()
    
    # 模拟推送 XML
    xml_body = f"""<xml>
      <ToUserName><![CDATA[gh_recipient]]></ToUserName>
      <FromUserName><![CDATA[{test_openid}]]></FromUserName>
      <CreateTime>{int(time.time())}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[登录]]></Content>
    </xml>"""
    
    url = f"http://127.0.0.1:8000/api/auth/wechat/callback?signature={signature}&timestamp={timestamp}&nonce={nonce}"
    
    print("\n--- 正在向本地后端服务发送模拟微信消息... ---")
    try:
        with httpx.Client() as client:
            response = client.post(url, content=xml_body, headers={"Content-Type": "application/xml"}, timeout=5.0)
        
        if response.status_code != 200:
            print(f"❌ 模拟推送失败！状态码: {response.status_code}, 内容: {response.text}")
            return
            
        root = ET.fromstring(response.text)
        reply_content = root.find("Content").text
        
        # 提取验证码
        import re
        match = re.search(r"【(\d{6})】", reply_content)
        if not match:
            print("❌ 回复的 XML 中没有提取到 6 位验证码")
            return
            
        code = match.group(1)
        
        print("\n" + "="*60)
        print("🎉 模拟微信后台推送验证码成功！")
        print("="*60)
        print("\n请执行以下步骤进行本地手动联调测试：")
        print("1. 浏览器打开本地前端地址：http://localhost:5173/login")
        print("2. 勾选底部的“我已阅读并同意服务协议...”复选框。")
        print("3. 切换到“微信登录”标签页。")
        print("4. 在验证码输入框中输入这 6 位验证码：")
        print(f"\n     👉 【  \033[1;33m{code}\033[0m  】 👈")
        print("\n5. 点击“立即登录”按钮，观察页面是否成功跳转回首页！")
        print("="*60)
        print("*(该验证码 5 分钟内有效。测试成功后，你可以告知我一键将代码部署同步至云服务器)*\n")
        
    except Exception as e:
        print(f"❌ 本地模拟运行异常: {e}")

if __name__ == "__main__":
    simulate()
