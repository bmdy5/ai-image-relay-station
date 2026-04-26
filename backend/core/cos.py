import base64
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import sys
import logging
from backend.core.config import get_config

# 配置日志
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

def upload_base64_to_cos(base64_data: str, filename: str):
    """将 Base64 数据直接上传到腾讯云 COS"""
    secret_id = get_config("TENCENT_CLOUD_SECRET_ID")
    secret_key = get_config("TENCENT_CLOUD_SECRET_KEY")
    region = get_config("TENCENT_CLOUD_COS_REGION")
    bucket = get_config("TENCENT_CLOUD_COS_BUCKET")

    if not all([secret_id, secret_key, region, bucket]):
        raise Exception("COS 配置不完整，请检查数据库 system_configs 表或 .env 文件")

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)

    # 提取 Base64 原始内容
    if "," in base64_data:
        _, encoded = base64_data.split(",", 1)
    else:
        encoded = base64_data
    
    body = base64.b64decode(encoded)

    # 上传
    client.put_object(
        Bucket=bucket,
        Body=body,
        Key=f"creations/{filename}",
        ContentType='image/png'
    )

    # 返回公网访问链接
    return f"https://{bucket}.cos.{region}.myqcloud.com/creations/{filename}"

def upload_url_to_cos(image_url: str, filename: str):
    """将外部 URL 图片转存到腾讯云 COS"""
    import httpx
    
    secret_id = get_config("TENCENT_CLOUD_SECRET_ID")
    secret_key = get_config("TENCENT_CLOUD_SECRET_KEY")
    region = get_config("TENCENT_CLOUD_COS_REGION")
    bucket = get_config("TENCENT_CLOUD_COS_BUCKET")

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)

    # 下载图片
    with httpx.Client() as h_client:
        response = h_client.get(image_url)
        if response.status_code != 200:
            raise Exception("无法下载原始图片")
        body = response.content

    # 上传
    client.put_object(
        Bucket=bucket,
        Body=body,
        Key=f"creations/{filename}",
        ContentType='image/png'
    )

    return f"https://{bucket}.cos.{region}.myqcloud.com/creations/{filename}"
