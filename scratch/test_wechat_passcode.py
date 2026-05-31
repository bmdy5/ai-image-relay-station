# scratch/test_wechat_passcode.py
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

def run_integration_test():
    print("=== 开始微信验证码登录流集成测试 ===")
    
    db = SessionLocal()
    
    # 1. 在数据库中配置测试 WECHAT_TOKEN
    test_token = "test_wechat_token_2026"
    print(f"1. 写入测试 WECHAT_TOKEN: {test_token}")
    
    config = db.query(models.SystemConfig).filter(models.SystemConfig.config_key == "WECHAT_TOKEN").first()
    if config:
        config.config_value = test_token
    else:
        config = models.SystemConfig(
            config_key="WECHAT_TOKEN",
            config_value=test_token,
            description="微信回调测试校验Token"
        )
        db.add(config)
    db.commit()
    
    # 清理已存在的测试用户和会话
    test_openid = "test_openid_user_999"
    db.query(models.User).filter(models.User.wechat_openid == test_openid).delete()
    db.query(models.WechatLoginCode).filter(models.WechatLoginCode.wechat_openid == test_openid).delete()
    db.commit()
    
    # 等待本地后端同步配置缓存 (cache TTL is 60s, but we can restart or wait. Let's make an HTTP request)
    # Note: Backend core config has a cache. Let's clear backend config cache by just waiting or forcing a query if running in-process. 
    # But since we run over HTTP, we wait or rely on the first database call after 60s. Or to bypass cache we can perform the request.
    # Let's see if we can calculate the signature.
    timestamp = str(int(time.time()))
    nonce = str(random.randint(1000, 9999))
    tmp_list = sorted([test_token, timestamp, nonce])
    tmp_str = "".join(tmp_list)
    signature = hashlib.sha1(tmp_str.encode("utf-8")).hexdigest()
    
    # 2. 模拟微信推送“登录”文字消息至回调接口
    print("2. 发送模拟的微信回调 XML 消息 (Content: 登录)")
    xml_body = f"""<xml>
      <ToUserName><![CDATA[gh_test_recipient]]></ToUserName>
      <FromUserName><![CDATA[{test_openid}]]></FromUserName>
      <CreateTime>{int(time.time())}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[登录]]></Content>
    </xml>"""
    
    url = f"http://127.0.0.1:8000/api/auth/wechat/callback?signature={signature}&timestamp={timestamp}&nonce={nonce}"
    
    # 发送回调请求
    with httpx.Client() as client:
        response = client.post(url, content=xml_body, headers={"Content-Type": "application/xml"}, timeout=5.0)
        
    print(f"微信回调接口返回状态码: {response.status_code}")
    response_text = response.text
    print(f"微信回调接口返回内容:\n{response_text}")
    
    assert response.status_code == 200, "回调接口请求失败"
    
    # 3. 解析返回的验证码
    root = ET.fromstring(response_text)
    reply_content = root.find("Content").text
    print(f"微信公众号自动回复文本: {reply_content}")
    
    # 提取 6 位验证码
    import re
    match = re.search(r"【(\d{6})】", reply_content)
    assert match, "自动回复内容中未包含 6 位数字验证码"
    code = match.group(1)
    print(f"成功解析出 6 位验证码: {code}")
    
    # 4. 模拟前端调用核销接口实现登录
    print("4. 前端调用核销接口登录: POST /api/auth/wechat/login-by-passcode")
    login_url = "http://127.0.0.1:8000/api/auth/wechat/login-by-passcode"
    
    with httpx.Client() as client:
        login_response = client.post(login_url, json={"code": code}, timeout=5.0)
        
    print(f"登录接口返回状态码: {login_response.status_code}")
    login_data = login_response.json()
    print(f"登录接口返回内容: {login_data}")
    
    assert login_response.status_code == 200, "登录接口核销失败"
    assert "access_token" in login_data, "返回数据未包含 JWT Token"
    
    # 5. 校验数据库中的用户是否正常注册并赠送积分
    print("5. 校验数据库记录...")
    db.expire_all()
    user = db.query(models.User).filter(models.User.wechat_openid == test_openid).first()
    assert user is not None, "测试用户未被静默创建"
    print(f"成功创建微信用户: Username: {user.username}, Points: {user.points}")
    assert user.points == 10, "注册积分赠送异常"
    
    # 校验验证码状态是否标为 used
    wechat_code = db.query(models.WechatLoginCode).filter(models.WechatLoginCode.code == code).first()
    assert wechat_code.status == "used", "验证码状态未正确更新为 used"
    print("验证码已成功核销为 used 状态！")
    
    # 6. 清理测试数据
    print("6. 清理测试数据...")
    db.delete(user)
    db.delete(wechat_code)
    # 恢复或删除测试 token 配置
    db.delete(config)
    db.commit()
    
    print("\n🎉 微信公众号扫码验证码登录流集成测试全部通过！完美！")

if __name__ == "__main__":
    try:
        run_integration_test()
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
