import hashlib
import os
from typing import Dict
from urllib.parse import urlencode

class PaymentService:
    @staticmethod
    def generate_sign(params: Dict, key: str) -> str:
        """
        生成易支付签名
        1. 过滤空值和 sign, sign_type
        2. 按键名升序排序
        3. 拼接 k=v&k=v...
        4. 拼接 key 并 MD5
        """
        # 过滤掉空值和不参与签名的参数
        filtered_params = {
            k: str(v) for k, v in params.items() 
            if v is not None and v != "" and k not in ["sign", "sign_type"]
        }
        # 按键名升序排序
        sorted_keys = sorted(filtered_params.keys())
        # 拼接字符串
        query_string = "&".join([f"{k}={filtered_params[k]}" for k in sorted_keys])
        # 拼接密钥并计算 MD5
        sign_str = query_string + key
        return hashlib.md5(sign_str.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_sign(params: Dict, key: str) -> bool:
        """
        验证回调签名
        """
        if "sign" not in params:
            return False
        actual_sign = params["sign"]
        expected_sign = PaymentService.generate_sign(params, key)
        return actual_sign == expected_sign

    @staticmethod
    def build_pay_url(api_url: str, params: Dict) -> str:
        """
        构造支付跳转链接
        """
        return f"{api_url}?{urlencode(params)}"
