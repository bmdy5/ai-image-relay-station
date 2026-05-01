import React from 'react';
import { 
  Coins, 
  Globe, 
  Infinity, 
  ShieldCheck, 
  Maximize2 
} from 'lucide-react';

const Showcase = ({ setPreviewImage, isMobile: propIsMobile }) => {
  // 内部兼容处理：如果没有传入 prop，则默认根据宽度判断
  const [isMobile, setIsMobile] = React.useState(propIsMobile ?? window.innerWidth < 768);

  React.useEffect(() => {
    if (propIsMobile !== undefined) {
      setIsMobile(propIsMobile);
    } else {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [propIsMobile]);

  return (
    <section style={{ marginTop: isMobile ? '40px' : '100px', paddingBottom: isMobile ? '40px' : '100px' }}>
      
      {/* PART 1: 核心优势 (解决痛点) */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '30px' : '60px', padding: '0 20px' }}>
        <div style={{ 
          display: 'inline-block', 
          background: '#e66b3310', 
          color: '#e66b33', 
          padding: isMobile ? '4px 12px' : '6px 16px', 
          borderRadius: '20px', 
          fontSize: isMobile ? '11px' : '13px', 
          fontWeight: 'bold', 
          marginBottom: '15px' 
        }}>
          GPT Image V2 · 重新定义 AI 创作
        </div>
        <h1 style={{ fontSize: isMobile ? '24px' : '36px', marginBottom: '15px', fontWeight: '800', letterSpacing: '-0.5px' }}>为什么选择 Visionary？</h1>
        <p style={{ color: '#666', maxWidth: '700px', margin: '0 auto', fontSize: isMobile ? '13px' : '16px', lineHeight: '1.6' }}>
          我们打破了官方繁琐的限制，为您提供最丝滑、最纯粹的云端创作体验。
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: isMobile ? '12px' : '20px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        marginBottom: isMobile ? '60px' : '120px',
        padding: '0 20px'
      }}>
        {[
          { title: "自由计费", fullTitle: "自由计费 (Pay-as-you-go)", desc: "拒绝强制包月。按需充值，每一分钱都用在刀刃上。", icon: <Coins size={isMobile ? 18 : 24} />, color: "#e66b33" },
          { title: "告别翻墙", fullTitle: "告别翻墙 (VPN Free)", desc: "无需加速器。国内丝滑直连，随时开启灵感。", icon: <Globe size={isMobile ? 18 : 24} />, color: "#3b82f6" },
          { title: "无限制创作", fullTitle: "无限制创作 (No Limits)", desc: "灵感永不断电，支持超长、超复杂绘图任务。", icon: <Infinity size={isMobile ? 18 : 24} />, color: "#8b5cf6" },
          { title: "零风控门槛", fullTitle: "零风控门槛 (Zero Risk)", desc: "告别封号风险。一键登录，立刻享受顶尖画质。", icon: <ShieldCheck size={isMobile ? 18 : 24} />, color: "#10b981" }
        ].map((item, idx) => (
          <div key={idx} className="card" style={{ 
            padding: isMobile ? '16px' : '30px', 
            transition: 'all 0.3s', 
            border: '1px solid #f0f0f0', 
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <div style={{ 
              width: isMobile ? '36px' : '48px', 
              height: isMobile ? '36px' : '48px', 
              background: `${item.color}10`, 
              color: item.color, 
              borderRadius: isMobile ? '10px' : '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: isMobile ? '12px' : '20px' 
            }}>
              {item.icon}
            </div>
            <h3 style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold', marginBottom: isMobile ? '6px' : '12px', color: '#1a1a1a' }}>
              {isMobile ? item.title : item.fullTitle}
            </h3>
            <p style={{ color: '#888', fontSize: isMobile ? '11px' : '14px', lineHeight: '1.5' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* PART 2: 能力故事画廊 (见证奇迹) */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '80px', padding: '0 20px' }}>
        <div style={{ display: 'inline-block', background: '#e66b3310', color: '#e66b33', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>
          作品画廊 · 灵感触手可及
        </div>
        <h1 style={{ fontSize: isMobile ? '28px' : '42px', marginBottom: '15px', fontWeight: '800', background: 'linear-gradient(90deg, #333, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {isMobile ? '见证无限可能' : '见证 GPT Image V2 的无限可能'}
        </h1>
        <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto', fontSize: isMobile ? '14px' : '18px' }}>
          从复杂攻略到严谨科普，每一张画作都是 AI 艺术的完美结晶。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '40px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {[
          { 
            id: '01', 
            title: "时空修复：赋予旧照新生", 
            color: "#e66b33", 
            img: "/showcase/repair_after.png", 
            beforeImg: "/showcase/repair_before.jpg",
            tags: ['4K 超清修复', '人像细节重构'], 
            featureLabel: "旗舰版 - 极致修复", 
            desc: "攻克了老旧照片破损、模糊、噪点多的难题。GPT Image V2 能够深度感知人像结构，在保留真实神韵的同时，将每一根发丝、每一处眼神光都恢复至影院级清晰度。" 
          },
          { 
            id: '02', 
            title: "纪实风格：捕捉光影瞬间", 
            color: "#3b82f6", 
            img: "/showcase/documentary_realism.png", 
            tags: ['电影级质感', '情绪光影'], 
            featureLabel: "专业版 - 纪实引擎", 
            desc: "不再是僵硬的 AI 生成感。我们追求极致的真实性，模拟徕卡、蔡司镜头的光学特性，让生成的画面具备浓郁的胶片色彩与细腻的颗粒感，每一张图都仿佛一段被定格的故事。" 
          },
          { 
            id: '03', 
            title: "极简海报：重定义视觉美学", 
            color: "#8b5cf6", 
            img: "/showcase/creative_poster.png", 
            tags: ['艺术留白', '平面设计'], 
            featureLabel: "标准版 - 创意引擎", 
            desc: "突破传统 AI 画面过满的弊端。我们的模型深谙“留白”与“排版”的艺术，能自动生成具备顶级设计师水准的极简海报，文字与构图和谐统一，专为高端商业宣发而生。" 
          },
          { 
            id: '04', 
            title: "旅游手账：记录指尖的旅行感", 
            color: "#10b981", 
            img: "/showcase/travel_journal.png", 
            tags: ['童趣手绘', '智能生成路线'], 
            featureLabel: "标准版 - 旅游手账", 
            desc: "我们的特色功能。只需输入目的地与天数，AI 即可自动生成一张充满童趣、带有虚线路线与手绘地标的旅行手账。让每一段旅程都拥有一份独一无二的视觉记忆。" 
          },
          { 
            id: '05', 
            title: "微距视界：每一像素都经得起推敲", 
            color: "#ec4899", 
            img: "/showcase/1.png", 
            tags: ['极致写实', '8K 画质'], 
            featureLabel: "旗舰版 - 极致写实", 
            desc: "针对产品与静物进行了专项增强。对皮肤纹理、金属材质、瞳孔倒影有着令人惊叹的还原力，完美适配电商、时尚等高要求商业场景。" 
          }
        ].map((item, idx) => (
          <div key={item.id} style={{ 
            background: idx % 2 === 0 ? '#fff' : (isMobile ? '#fff' : '#fafafa'), 
            borderRadius: isMobile ? '24px' : '32px', 
            padding: isMobile ? '24px' : '60px', 
            boxShadow: isMobile ? '0 8px 24px rgba(0,0,0,0.04)' : 'none',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
            gap: isMobile ? '24px' : '80px',
            alignItems: 'center'
          }}>
            <div style={{ order: (isMobile || idx % 2 === 0) ? 0 : 1 }}>
              <div style={{ color: item.color, fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE {item.id}</div>
              <h2 style={{ fontSize: isMobile ? '22px' : '36px', fontWeight: '800', marginBottom: '20px', color: '#1a1a1a', lineHeight: '1.2' }}>{item.title}</h2>
              <p style={{ color: '#666', lineHeight: '1.8', fontSize: isMobile ? '13px' : '16px', marginBottom: '24px' }}>{item.desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {item.tags.map(tag => (
                  <span key={tag} style={{ background: `${item.color}08`, border: `1px solid ${item.color}15`, padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: item.color, fontWeight: '600' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div 
              style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
              onClick={() => setPreviewImage(item.img)}
              className="showcase-img-wrapper"
            >
              {/* 修复对比特有的分屏布局 (手机端上下堆叠，PC端左右平铺) */}
              {item.beforeImg ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '4px', 
                  borderRadius: isMobile ? '16px' : '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 30px 60px rgba(0,0,0,0.12)' 
                }}>
                  <div style={{ 
                    flex: isMobile ? 'none' : 1, 
                    position: 'relative', 
                    height: isMobile ? '250px' : '460px',
                    width: '100%'
                  }}>
                    <img src={item.beforeImg} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="Before" />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>BEFORE</div>
                  </div>
                  <div style={{ 
                    flex: isMobile ? 'none' : 1, 
                    position: 'relative', 
                    height: isMobile ? '250px' : '460px',
                    width: '100%'
                  }}>
                    <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="After" />
                    <div style={{ position: 'absolute', top: isMobile ? '10px' : '10px', right: '10px', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>AFTER</div>
                  </div>
                </div>
              ) : (
                <img src={item.img} style={{ width: '100%', borderRadius: isMobile ? '16px' : '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', display: 'block' }} alt={item.title} />
              )}
              
              {/* 功能标签悬浮层 */}
              <div style={{ 
                position: 'absolute', 
                bottom: isMobile ? '12px' : '24px', 
                left: isMobile ? '12px' : '24px', 
                background: 'rgba(0,0,0,0.6)', 
                backdropFilter: 'blur(10px)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1px',
                zIndex: 5
              }}>
                {item.featureLabel}
              </div>
              
              <div style={{ position: 'absolute', top: isMobile ? '12px' : '24px', right: isMobile ? '12px' : '24px', background: 'rgba(255,255,255,0.9)', padding: isMobile ? '8px' : '12px', borderRadius: '50%', zIndex: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Maximize2 size={isMobile ? 14 : 20} color={item.color} />
              </div>
              
              {/* 装饰层 */}
              <div style={{ 
                position: 'absolute', inset: 0, borderRadius: isMobile ? '16px' : '24px',
                background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.1) 100%)',
                pointerEvents: 'none'
              }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Showcase;
