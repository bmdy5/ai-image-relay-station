import json

def parse_friendly_error(error_msg: str) -> str:
    """
    将底层原始报错转换为用户友好的中文提示信息
    """
    err_lower = error_msg.lower()
    
    # 1. 拦截词风控 (版权/敏感词)
    if "moderation_blocked" in err_lower or "rejected by the safety system" in err_lower:
        return "生成失败：提示词可能包含敏感词或知名版权角色（已被安全系统拦截）。建议删掉影视/动漫等版权名称，或直接上传相关图片作为【参考图】来替代文字名词生成。"
    
    # 2. 额度/余额耗尽
    if "insufficient_quota" in err_lower or "billing_hard_limit_reached" in err_lower:
        return "生成失败：接口生图额度已耗尽，请联系管理员充值或更换渠道。"
        
    # 3. 鉴权失败
    if "invalid_api_key" in err_lower or "incorrect api key" in err_lower or "401" in err_lower:
        return "生成失败：接口鉴权配置无效，请联系管理员检查配置。"
        
    # 4. 频率超限
    if "rate_limit_exceeded" in err_lower or "429" in err_lower:
        return "生成失败：上游接口调用过于频繁，请稍等片刻后再试。"
        
    # 5. 上游错误
    if "502" in err_lower or "503" in err_lower or "504" in err_lower or "500" in err_lower:
        return "生成失败：上游生图服务器暂时繁忙或异常，请稍后再试。"
        
    # 6. 超时/连接错误
    if "timeout" in err_lower or "connecterror" in err_lower:
        return "生成失败：网络连接超时，上游服务器未及时响应，请稍后重试。"
        
    # 7. 无效的图片编辑/格式要求
    if "valid png" in err_lower or "alpha channel" in err_lower:
        return "生成失败：上游接口要求上传的参考图必须是带透明背景（Alpha通道）的正方形 PNG 格式图片。"

    # 8. 默认回退（尝试提取 JSON 里的 message）
    try:
        if "{" in error_msg and "}" in error_msg:
            json_str = error_msg[error_msg.find("{"):error_msg.rfind("}")+1]
            data = json.loads(json_str)
            if "error" in data and "message" in data["error"]:
                msg = data["error"]["message"]
                return f"生成失败：{msg}"
    except Exception:
        pass

    return f"生成失败：系统遇到未知错误，请重试或联系管理员。"
