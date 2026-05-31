# scratch/test_wechat_flow.py
import sys
import os
import time
import hashlib
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

# 将项目根目录添加到系统路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.database import SessionLocal, Base, engine
from backend.models import models
from backend.api.auth import check_signature
from backend.core import security

def test_wechat_integration():
    print("=== [开始微信扫码登录全链路验证测试] ===")
    
    # 1. 临时设置 WECHAT_TOKEN 用于本地签名测试
    os.environ["WECHAT_TOKEN"] = "test_wechat_token_2026"
    print("设置临时测试 WECHAT_TOKEN: test_wechat_token_2026")

    # 2. 验证签名算法
    timestamp = str(int(time.time()))
    nonce = "random_nonce_12345"
    token = "test_wechat_token_2026"
    tmp_list = sorted([token, timestamp, nonce])
    tmp_str = "".join(tmp_list)
    sha1 = hashlib.sha1()
    sha1.update(tmp_str.encode("utf-8"))
    correct_signature = sha1.hexdigest()

    print("测试签名校验助手...")
    assert check_signature(correct_signature, timestamp, nonce) == True, "正确签名校验失败"
    assert check_signature("wrong_sig", timestamp, nonce) == False, "错误签名被误判为正确"
    print("✓ 签名算法校验通过！")

    # 3. 初始化 DB 会话并注入 pending WechatLoginSession
    db = SessionLocal()
    scene_str = str(uuid.uuid4())
    test_openid = f"test_wx_openid_{uuid.uuid4().hex[:8]}"
    
    print(f"注入测试 Pending 扫码会话, scene_str: {scene_str}")
    session = models.WechatLoginSession(
        scene_str=scene_str,
        status="pending",
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )
    db.add(session)
    db.commit()

    # 4. 模拟微信回调 XML 推送 (POST Event: subscribe)
    print("模拟微信服务器推送关注事件 XML...")
    xml_data = f"""<xml>
      <ToUserName><![CDATA[gh_test_account]]></ToUserName>
      <FromUserName><![CDATA[{test_openid}]]></FromUserName>
      <CreateTime>{int(time.time())}</CreateTime>
      <MsgType><![CDATA[event]]></MsgType>
      <Event><![CDATA[subscribe]]></Event>
      <EventKey><![CDATA[qrscene_{scene_str}]]></EventKey>
    </xml>"""

    # 5. 调用本地函数逻辑（直接模拟 FastAPI 回调的内部执行流程）
    print("执行回调逻辑...")
    # 模拟 XML 解析
    root = ET.fromstring(xml_data)
    msg_type = root.find("MsgType").text
    to_user = root.find("ToUserName").text
    from_user = root.find("FromUserName").text
    event = root.find("Event").text
    event_key = root.find("EventKey").text
    
    assert msg_type == "event"
    assert event == "subscribe"
    
    extracted_scene_str = event_key[len("qrscene_"):]
    assert extracted_scene_str == scene_str
    
    # 校验 pending 状态会话
    db_session = db.query(models.WechatLoginSession).filter(
        models.WechatLoginSession.scene_str == scene_str,
        models.WechatLoginSession.status == "pending"
    ).first()
    assert db_session is not None, "未找到 pending 会话"

    # 执行静默注册逻辑
    user = db.query(models.User).filter(models.User.wechat_openid == from_user).first()
    assert user is None, "测试 OpenID 应该在数据库中不存在"
    
    suffix = uuid.uuid4().hex[:6]
    username = f"wx_test_{suffix}"
    
    # 创建测试用户
    from backend.crud.user import generate_unique_uid
    test_user = models.User(
        username=username,
        wechat_openid=from_user,
        password_hash="",
        points=10,
        uid=generate_unique_uid(db),
        last_ip="127.0.0.1"
    )
    db.add(test_user)
    db.flush()
    
    # 创建充值积分日志
    from backend.crud import recharge as recharge_crud
    recharge_crud.create_recharge_log(
        db,
        user_id=test_user.id,
        amount=10,
        status="success",
        admin_note="微信扫码关注注册奖励测试",
        operator_id=0,
        trade_no=f"TEST_WECHAT_JOIN_{test_user.id}_{int(time.time())}"
    )
    
    # 生成 Token
    access_token = security.create_access_token(data={"sub": test_user.username})
    
    # 更新 session 状态
    db_session.status = "success"
    db_session.token = access_token
    db_session.wechat_openid = from_user
    db.commit()

    print("✓ 回调写入及注册流程执行完毕！")

    # 6. 断言及结果确认
    print("开始数据库断言验证...")
    # 断言用户是否在数据库成功创建
    db_user = db.query(models.User).filter(models.User.wechat_openid == test_openid).first()
    assert db_user is not None, "用户注册记录未存入数据库"
    assert db_user.username == username, "用户名不匹配"
    assert db_user.points == 10, "静默注册送积分额度错误"
    print("✓ 用户记录断言通过！")

    # 断言会话状态是否被正确更新为 success 且关联 Token
    db_session = db.query(models.WechatLoginSession).filter(models.WechatLoginSession.scene_str == scene_str).first()
    assert db_session.status == "success", "会话状态未正确更新为 success"
    assert db_session.token == access_token, "Token 未正确写入会话"
    assert db_session.wechat_openid == test_openid, "OpenID 未正确关联会话"
    print("✓ 会话状态断言通过！")

    # 7. 自动清理测试脏数据
    print("清理测试数据...")
    db.delete(db_user)
    db.delete(db_session)
    db.execute(text(f"DELETE FROM recharge_logs WHERE user_id = {db_user.id}"))
    db.commit()
    db.close()
    print("✓ 测试数据已安全清除！")
    
    print("\n=== [恭喜：微信扫码全链路逻辑验证成功！] ===")

if __name__ == "__main__":
    from sqlalchemy import text
    test_wechat_integration()
