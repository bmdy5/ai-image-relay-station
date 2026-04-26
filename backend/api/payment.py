import os
import random
import string
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models import models
from ..core.payment import PaymentService
from ..core.deps import get_current_user
from ..schemas import user as user_schema
from ..core.config import get_config

router = APIRouter(prefix="/payment", tags=["payment"])

def generate_out_trade_no():
    """生成 20 位唯一的商户订单号"""
    return f"{time.strftime('%Y%m%d%H%M%S')}{''.join(random.choices(string.digits, k=6))}"

@router.post("/create")
def create_payment(
    data: user_schema.RechargeApply,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """创建支付订单并返回支付链接"""
    # 转换为整数，防止小数绕过
    money_int = int(data.money_amount)
    if money_int < 1:
        raise HTTPException(status_code=400, detail="最低充值金额为 1 元")
    
    out_trade_no = generate_out_trade_no()
    # 换算积分逻辑：匹配套餐优惠
    if money_int == 10:
        points_amount = 100
    elif money_int == 45:
        points_amount = 500
    elif money_int == 90:
        points_amount = 1000
    elif money_int == 500:
        points_amount = 8000
    else:
        # 普通自定义金额按 1:10
        points_amount = money_int * 10
    
    # 1. 持久化订单到数据库
    db_log = models.RechargeLog(
        user_id=current_user.id,
        money_amount=data.money_amount,
        amount=points_amount,
        out_trade_no=out_trade_no,
        payment_method="wxpay",  # 默认为微信支付，可扩展
        status="pending"
    )
    db.add(db_log)
    db.commit()
    
    # 2. 读取配置并构造支付参数 (优先从数据库 system_configs 获取)
    pid = get_config("PAYLE_PID")
    key = get_config("PAYLE_KEY")
    api_url = get_config("PAYLE_API_URL")
    notify_url = get_config("PAYLE_NOTIFY_URL")
    return_url = get_config("PAYLE_RETURN_URL")
    
    if not all([pid, key, api_url]):
        raise HTTPException(status_code=500, detail="支付配置缺失，请联系管理员")

    params = {
        "pid": pid,
        "type": "wxpay",
        "out_trade_no": out_trade_no,
        "notify_url": notify_url,
        "return_url": return_url,
        "name": f"积分充值-{points_amount}积分",
        "money": f"{data.money_amount:.2f}",
        "sitename": "GPT-Image2"
    }
    
    # 3. 生成签名并拼装 URL
    sign = PaymentService.generate_sign(params, key)
    params["sign"] = sign
    params["sign_type"] = "MD5"
    
    pay_url = PaymentService.build_pay_url(api_url, params)
    
    return {
        "pay_url": pay_url, 
        "out_trade_no": out_trade_no,
        "money": data.money_amount,
        "points": points_amount
    }

@router.get("/notify")
def payment_notify(request: Request, db: Session = Depends(get_db)):
    """接收支付乐的异步通知 (GET 方式)"""
    params = dict(request.query_params)
    key = get_config("PAYLE_KEY")
    
    # 1. 签名验证
    if not PaymentService.verify_sign(params, key):
        return "fail_sign"
    
    # 2. 检查支付状态
    if params.get("trade_status") == "TRADE_SUCCESS":
        out_trade_no = params.get("out_trade_no")
        trade_no = params.get("trade_no")
        
        # 3. 开启事务处理订单
        db_log = db.query(models.RechargeLog).filter(
            models.RechargeLog.out_trade_no == out_trade_no,
            models.RechargeLog.status == "pending"
        ).with_for_update().first()
        
        if db_log:
            # 核对金额 (可选，增加安全性)
            # if float(params.get("money")) != float(db_log.money_amount):
            #     return "fail_money"

            db_log.status = "success"
            db_log.trade_no = trade_no
            
            # 自动发放积分
            user = db.query(models.User).filter(models.User.id == db_log.user_id).with_for_update().first()
            if user:
                user.points += db_log.amount
            
            db.commit()
            return "success"
            
    return "success"

@router.get("/status/{out_trade_no}")
def get_payment_status(out_trade_no: str, db: Session = Depends(get_db)):
    """供前端轮询订单状态"""
    db_log = db.query(models.RechargeLog).filter(models.RechargeLog.out_trade_no == out_trade_no).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    return {
        "status": db_log.status,
        "money": db_log.money_amount,
        "points": db_log.amount,
        "created_at": db_log.created_at
    }
