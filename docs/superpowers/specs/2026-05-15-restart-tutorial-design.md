# 个人中心新增“重新开始新手引导”功能设计方案

## 1. 背景与目标
目前新手引导（Onboarding Tutorial）仅在用户首次登录或未完成时触发。为了方便用户（或测试人员）随时回顾功能指引，需要在 PC 和移动端的个人中心（Profile Page）增加一个主动触发引导的入口。

## 2. 核心逻辑
- **存储清理**：清除 `localStorage` 中的 `visionary_guide_v1` 键值。
- **确认交互**：在执行重置前弹出确认框，防止误操作。
- **页面跳转**：重置后强制跳转至首页 (`/`)，首页的 `TutorialContext` 会自动检测并启动引导。

## 3. UI/UX 设计

### 3.1 PC 端 (`PCProfilePage.jsx`)
- **位置**：账户概览 -> 快速操作网格。
- **样式**：
  - 图标：`HelpCircle` (lucide-react)
  - 标题：新手引导
  - 描述：重新查看功能指引
- **交互**：
  ```javascript
  const handleRestartGuide = () => {
    if (window.confirm('确定要重新开始新手引导吗？')) {
      localStorage.removeItem('visionary_guide_v1');
      navigate('/');
    }
  };
  ```

### 3.2 移动端 (`MobileProfilePage.jsx`)
- **位置**：设置与反馈列表。
- **样式**：
  - 图标：`HelpCircle` (lucide-react)
  - 文字：新手引导
  - 右侧：`ChevronRight` 箭头
- **交互**：逻辑同 PC 端。

## 4. 实施清单 (Tasks)
- [ ] 修改 `PCProfilePage.jsx`：
  - 导入 `HelpCircle` 图标。
  - 添加 `handleRestartGuide` 函数。
  - 在“快速操作”网格末尾插入新卡片。
- [ ] 修改 `MobileProfilePage.jsx`：
  - 导入 `HelpCircle` 图标。
  - 添加重置逻辑。
  - 在列表菜单中插入新项目。

## 5. 验收标准
1. 点击按钮能正常弹出系统确认框。
2. 确认后能够正确跳转到首页。
3. 首页能够立即显示引导蒙层，并从第 1 步开始播放。
