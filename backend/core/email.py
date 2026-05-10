import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from .config import get_config

logger = logging.getLogger(__name__)

def send_verification_email(to_email: str, code: str, purpose: str = "register") -> bool:
    """
    发送验证码邮件。
    优先从数据库 (system_configs 表) 读取配置，其次读取环境变量。
    purpose: "register" 注册验证码, "reset_password" 找回密码验证码
    """
    # 根据用途区分邮件标题和内容
    if purpose == "reset_password":
        subject = "找回密码验证码 - Visionary AI"
        body = f"您正在找回密码，验证码为：{code}\n\n该验证码有效期为 5 分钟。请勿将验证码泄露给他人。\n\n如非本人操作，请忽略此邮件。"
    elif purpose == "login":
        subject = "登录验证码 - Visionary AI"
        body = f"您的登录验证码为：{code}\n\n该验证码有效期为 10 分钟。请勿将验证码泄露给他人。\n\n如非本人操作，请忽略此邮件。"
    else:
        subject = "注册验证码 - Visionary AI"
        body = f"您的注册验证码为：{code}\n\n该验证码有效期为 5 分钟。请勿将验证码泄露给他人。\n\n如非本人操作，请忽略此邮件。"

    smtp_server = get_config("SMTP_SERVER")
    smtp_port = int(get_config("SMTP_PORT", 465))
    smtp_user = get_config("SMTP_USER")
    smtp_password = get_config("SMTP_PASSWORD")

    if not smtp_server:
        logger.warning("SMTP_SERVER is not configured. Falling back to Console Mock.")
        print(f"\n{'='*40}")
        print(f"[MOCK EMAIL] TO: {to_email}")
        print(f"[MOCK EMAIL] CODE: {code}")
        print(f"[MOCK EMAIL] PURPOSE: {purpose}")
        print(f"{'='*40}\n")
        return True
    
    try:
        msg = MIMEMultipart()
        msg['From'] = f"Visionary AI <{smtp_user}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        if int(smtp_port) == 465:
            server = smtplib.SMTP_SSL(smtp_server, int(smtp_port))
        else:
            server = smtplib.SMTP(smtp_server, int(smtp_port))
            server.starttls()
            
        if smtp_user and smtp_password:
            server.login(smtp_user, smtp_password)
            
        server.send_message(msg)
        server.quit()
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
