# backend/services/wechat_service.py
import httpx
import logging
import time
from typing import Optional
from ..core.config import get_config

logger = logging.getLogger(__name__)

class WechatService:
    _access_token: Optional[str] = None
    _token_expiry: float = 0.0

    @classmethod
    async def get_access_token(cls) -> str:
        """
        获取微信公众号的 Access Token，支持内存缓存自愈与自动刷新 (有效期 2 小时)
        """
        now = time.time()
        # 预留 5 分钟提前刷新
        if cls._access_token and now < cls._token_expiry - 300:
            return cls._access_token

        app_id = get_config("WECHAT_APP_ID")
        app_secret = get_config("WECHAT_APP_SECRET")
        if not app_id or not app_secret:
            raise ValueError("未配置 WECHAT_APP_ID 或 WECHAT_APP_SECRET，无法获取微信 Token")

        url = "https://api.weixin.qq.com/cgi-bin/token"
        params = {
            "grant_type": "client_credential",
            "appid": app_id,
            "secret": app_secret
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=10.0)
                data = response.json()
                if "access_token" in data:
                    cls._access_token = data["access_token"]
                    cls._token_expiry = now + float(data["expires_in"])
                    logger.info("微信 Access Token 刷新成功！")
                    return cls._access_token
                else:
                    err_msg = data.get("errmsg", "未知错误")
                    logger.error(f"获取微信 Access Token 失败: {data}")
                    raise ValueError(f"微信接口报错: {err_msg}")
            except Exception as e:
                logger.error(f"请求微信接口获取 Access Token 异常: {e}")
                raise

    @classmethod
    async def create_temporary_qrcode(cls, scene_str: str, expire_seconds: int = 300) -> str:
        """
        生成临时带参数二维码，返回用于直接展示的二维码 URL
        """
        token = await cls.get_access_token()
        url = f"https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token={token}"
        payload = {
            "expire_seconds": expire_seconds,
            "action_name": "QR_STR_SCENE",
            "action_info": {
                "scene": {
                    "scene_str": scene_str
                }
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=10.0)
                data = response.json()
                if "ticket" in data:
                    ticket = data["ticket"]
                    # 微信官方换取二维码的接口，可以直接作为 img 标签的 src
                    qrcode_url = f"https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket={ticket}"
                    return qrcode_url
                else:
                    err_msg = data.get("errmsg", "未知错误")
                    logger.error(f"获取微信临时二维码 ticket 失败: {data}")
                    raise ValueError(f"生成二维码失败: {err_msg}")
            except Exception as e:
                logger.error(f"生成微信临时二维码异常: {e}")
                raise
