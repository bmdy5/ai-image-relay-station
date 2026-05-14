# Redemption Code Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a universal redemption code system with usage limits, expiration, and anti-fraud measures.

**Architecture:** Add two new database tables (`redemption_codes`, `redemption_records`), implement redemption logic in the user API with pessimistic locking for concurrency safety, and add UI components to PC, Mobile, and Admin pages.

**Tech Stack:** Python (FastAPI/SQLAlchemy), React (Vite/Tailwind-like vanilla CSS), SQLite.

---

### Task 1: Database Models & Migration

**Files:**
- Modify: `backend/models/models.py`
- Create: `scratch/migrate_redemption.py`

- [ ] **Step 1: Add RedemptionCode and RedemptionRecord models**

```python
# backend/models/models.py

class RedemptionCode(Base):
    __tablename__ = "redemption_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    points = Column(Integer, default=50)
    max_uses = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_beijing_time)

class RedemptionRecord(Base):
    __tablename__ = "redemption_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    code_id = Column(Integer, ForeignKey("redemption_codes.id"))
    fingerprint = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_beijing_time)

    __table_args__ = (
        UniqueConstraint("user_id", "code_id", name="uix_user_code"),
    )
```

- [ ] **Step 2: Create migration script to create tables**

```python
# scratch/migrate_redemption.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.models.database import engine, Base
from backend.models.models import RedemptionCode, RedemptionRecord

def migrate():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

if __name__ == "__main__":
    migrate()
```

- [ ] **Step 3: Run migration script**

Run: `python3 scratch/migrate_redemption.py`
Expected: "Tables created successfully"

- [ ] **Step 4: Commit**

### Task 2: Backend Schemas & Redemption Logic

**Files:**
- Modify: `backend/schemas/user.py`
- Modify: `backend/api/user.py`

- [ ] **Step 1: Add RedemptionSchema**

```python
# backend/schemas/user.py
class RedemptionRequest(BaseModel):
    code: str
```

- [ ] **Step 2: Implement redemption API with safety checks**

```python
# backend/api/user.py
@router.post("/redeem")
def redeem_code(
    data: user_schema.RedemptionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from datetime import datetime
    from sqlalchemy import and_
    
    # 1. Frequency limit (simplified for now, can use Redis/Cache if needed)
    # 2. Find code
    code_obj = db.query(models.RedemptionCode).filter(
        models.RedemptionCode.code == data.code,
        models.RedemptionCode.is_active == True
    ).with_for_update().first() # Pessimistic lock
    
    if not code_obj:
        raise HTTPException(status_code=400, detail="兑换码无效或已关闭")
    
    # 3. Check time
    now = get_beijing_time()
    if code_obj.start_time and now < code_obj.start_time:
        raise HTTPException(status_code=400, detail="兑换尚未开始")
    if code_obj.end_time and now > code_obj.end_time:
        raise HTTPException(status_code=400, detail="兑换已结束")
    
    # 4. Check total capacity
    if code_obj.used_count >= code_obj.max_uses:
        raise HTTPException(status_code=400, detail="兑换次数已达上限")
    
    # 5. Check duplicate for user
    existing = db.query(models.RedemptionRecord).filter(
        models.RedemptionRecord.user_id == current_user.id,
        models.RedemptionRecord.code_id == code_obj.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="您已兑换过此代码")
    
    # 6. Anti-fraud: Fingerprint limit (max 3 accounts per fingerprint per code)
    if current_user.fingerprint:
        fp_count = db.query(models.RedemptionRecord).filter(
            models.RedemptionRecord.code_id == code_obj.id,
            models.RedemptionRecord.fingerprint == current_user.fingerprint
        ).count()
        if fp_count >= 3:
            raise HTTPException(status_code=400, detail="该设备兑换次数超限")
            
    # 7. Apply points and record
    code_obj.used_count += 1
    current_user.points += code_obj.points
    
    record = models.RedemptionRecord(
        user_id=current_user.id,
        code_id=code_obj.id,
        fingerprint=current_user.fingerprint
    )
    db.add(record)
    
    # Optional: Log to recharge_logs for history visibility
    recharge_log = models.RechargeLog(
        user_id=current_user.id,
        amount=code_obj.points,
        money_amount=0,
        status="success",
        admin_note=f"兑换码: {code_obj.code}",
        trade_no=f"REDEEM_{code_obj.id}_{current_user.id}_{int(datetime.now().timestamp())}"
    )
    db.add(recharge_log)
    
    db.commit()
    return {"message": f"兑换成功！已获得 {code_obj.points} 积分", "points_added": code_obj.points}
```

- [ ] **Step 3: Commit**

### Task 3: Admin API for Code Management

**Files:**
- Modify: `backend/api/admin.py`
- Modify: `backend/schemas/user.py`

- [ ] **Step 1: Add Admin schemas**

```python
# backend/schemas/user.py
class RedemptionCodeCreate(BaseModel):
    code: str
    points: int = 50
    max_uses: int = 100
    is_active: bool = True
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class RedemptionCodeInfo(RedemptionCodeCreate):
    id: int
    used_count: int
    created_at: datetime
    class Config:
        from_attributes = True
```

- [ ] **Step 2: Add Admin endpoints to admin.py**

```python
# backend/api/admin.py
@router.post("/redemption-codes", response_model=user_schema.RedemptionCodeInfo)
def create_redemption_code(
    data: user_schema.RedemptionCodeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    db_code = models.RedemptionCode(**data.model_dump())
    db.add(db_code)
    db.commit()
    db.refresh(db_code)
    return db_code

@router.get("/redemption-codes", response_model=List[user_schema.RedemptionCodeInfo])
def list_redemption_codes(
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    return db.query(models.RedemptionCode).order_by(models.RedemptionCode.created_at.desc()).all()

@router.patch("/redemption-codes/{code_id}")
def toggle_redemption_code(
    code_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    code = db.query(models.RedemptionCode).filter(models.RedemptionCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="兑换码不存在")
    code.is_active = is_active
    db.commit()
    return {"message": "状态已更新"}
```

- [ ] **Step 3: Commit**

### Task 4: Frontend PC UI

**Files:**
- Modify: `frontend/src/pages/PCProfilePage.jsx`

- [ ] **Step 1: Add Redemption tab and UI logic**

```javascript
// frontend/src/pages/PCProfilePage.jsx
// Add 'Gift' to imports from 'lucide-react'
// Add 'redeemCode' state
const [redeemCode, setRedeemCode] = useState('');

// Add handleRedeem function
const handleRedeem = async () => {
  if (!redeemCode) return;
  setLoading(true);
  try {
    const res = await request.post('/user/redeem', { code: redeemCode });
    alert(res.message);
    setRedeemCode('');
    fetchData();
  } catch (err) {
    alert(err.response?.data?.detail || '兑换失败');
  } finally {
    setLoading(false);
  }
};

// Add SidebarItem for 'redeem'
// Add activeTab === 'redeem' section in main content
```

- [ ] **Step 2: Commit**

### Task 5: Frontend Mobile UI

**Files:**
- Modify: `frontend/src/pages/MobileProfilePage.jsx`

- [ ] **Step 1: Add Redemption Item and Drawer**

```javascript
// frontend/src/pages/MobileProfilePage.jsx
// Add 'Gift' to imports
// Add 'redeem' to activeDrawer state possibilities
// Add 'redeemCode' state
// Add handleRedeem logic
// Add SettingItem for redemption
// Add MobileDrawer for 'redeem'
```

- [ ] **Step 2: Commit**

### Task 6: Frontend Admin UI

**Files:**
- Modify: `frontend/src/pages/AdminPage.jsx`

- [ ] **Step 1: Add Redemption Management section**
- [ ] **Step 2: Commit**

### Task 7: Initial Data

- [ ] **Step 1: Create a default 'WELCOME50' code using Admin API or direct SQL**
- [ ] **Step 2: Verify the whole flow**
