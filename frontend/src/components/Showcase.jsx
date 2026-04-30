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
          { id: '01', title: "复杂长图排版能力", color: "#e66b33", img: "/showcase/2.png", tags: ['高清输出', '文字精准'], featureLabel: "高清版 - 均衡模型", desc: "支持超长纵向画布输出，精准处理数千字的逻辑排版。无论是旅游攻略、购物清单还是工作流设计，都能做到字体清晰、布局优雅。" },
          { id: '02', title: "知识图谱海报生成", color: "#3b82f6", img: "/showcase/3.png", tags: ['科普海报', '信息可视化'], featureLabel: "高清版 - 创意引擎", desc: "GPT Image V2 能够深度理解深奥的科学概念，并将其转化为极具亲和力的视觉语言。科普教育不再枯燥。" },
          { id: '03', title: "中文字体与海报设计", color: "#8b5cf6", img: "/showcase/image.png", tags: ['精准中文', '意境融合'], featureLabel: "大师版 - 艺术引擎", desc: "攻克了 AI 绘图领域最难的中文字体精准排版。无论是武侠仙侠、科幻电影还是商业海报，都能实现震撼呈现。" },
          { id: '04', title: "学术图表与复杂公式", color: "#ec4899", img: "/showcase/5.png", tags: ['逻辑架构', '专业设计'], featureLabel: "高清版 - 逻辑模型", desc: "只需输入正文逻辑和图表需求，即可生成排版完美的学术流程图或逻辑架构图。不再有乱码，只有严谨结构。" },
          { id: '05', title: "极致微距细节", color: "#10b981", img: "/showcase/1.png", tags: ['微距画质', '商业级别'], featureLabel: "PRO - 极致写实", desc: "支持超高分辨率渲染，对瞳孔倒影、发丝细节、材质纹理有着极其恐怖的还原力。每一像素都经得起无限放大。" }
        ].map((item, idx) => (
          <div key={item.id} style={{ 
            background: idx % 2 === 0 ? '#fff' : (isMobile ? '#fff' : '#fafafa'), 
            borderRadius: isMobile ? '24px' : '32px', 
            padding: isMobile ? '24px' : '60px', 
            boxShadow: isMobile ? '0 8px 24px rgba(0,0,0,0.04)' : 'none',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
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
            >
              <div style={{ position: 'absolute', top: isMobile ? '12px' : '24px', right: isMobile ? '12px' : '24px', background: 'rgba(255,255,255,0.9)', padding: isMobile ? '8px' : '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Maximize2 size={isMobile ? 14 : 20} color={item.color} />
              </div>
              <div style={{ 
                position: 'absolute', 
                bottom: isMobile ? '12px' : '24px', 
                left: isMobile ? '12px' : '24px', 
                background: 'rgba(0,0,0,0.4)', 
                backdropFilter: 'blur(10px)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '1px',
                zIndex: 1,
                opacity: 0.8
              }}>
                {item.featureLabel}
              </div>
              <img src={item.img} style={{ width: '100%', borderRadius: isMobile ? '16px' : '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt={item.title} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Showcase;
