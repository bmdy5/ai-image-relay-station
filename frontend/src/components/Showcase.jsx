import React from 'react';
import { 
  Coins, 
  Globe, 
  Infinity, 
  ShieldCheck, 
  Maximize2 
} from 'lucide-react';

const Showcase = ({ setPreviewImage }) => {
  return (
    <section style={{ marginTop: '100px', paddingBottom: '100px' }}>
      
      {/* PART 1: 核心优势 (解决痛点) */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'inline-block', background: '#e66b3310', color: '#e66b33', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>
          GPT Image V2 · 重新定义 AI 创作
        </div>
        <h1 style={{ fontSize: '36px', marginBottom: '15px', fontWeight: '800' }}>为什么选择 Visionary？</h1>
        <p style={{ color: '#666', maxWidth: '700px', margin: '0 auto', fontSize: '16px' }}>
          我们打破了官方繁琐的限制，为您提供最丝滑、最纯粹的云端创作体验。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', marginBottom: '120px' }}>
        {[
          { title: "自由计费 (Pay-as-you-go)", desc: "拒绝强制包月费。0 月费门槛，按需充值，每一分钱都用在刀刃上。", icon: <Coins size={24} />, color: "#e66b33" },
          { title: "告别翻墙 (VPN Free)", desc: "无需昂贵的加速器。国内丝滑直连，随时随地开启您的创意灵感。", icon: <Globe size={24} />, color: "#3b82f6" },
          { title: "无限制创作 (No Limits)", desc: "这里没有低配限制。只要有积分，灵感永不断电，支持超长绘图任务。", icon: <Infinity size={24} />, color: "#8b5cf6" },
          { title: "零风控门槛 (Zero Risk)", desc: "告别繁琐的国外地址和封号风险。一键登录，立刻享受顶尖画质。", icon: <ShieldCheck size={24} />, color: "#10b981" }
        ].map((item, idx) => (
          <div key={idx} className="card" style={{ padding: '30px', transition: 'all 0.3s', border: '1px solid #f0f0f0', background: '#fff' }}>
            <div style={{ width: '48px', height: '48px', background: `${item.color}10`, color: item.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              {item.icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{item.title}</h3>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* PART 2: 能力故事画廊 (见证奇迹) */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ display: 'inline-block', background: '#e66b3310', color: '#e66b33', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>
          作品画廊 · 灵感触手可及
        </div>
        <h1 style={{ fontSize: '42px', marginBottom: '15px', fontWeight: '800', background: 'linear-gradient(90deg, #333, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>见证 GPT Image V2 的无限可能</h1>
        <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto', fontSize: '18px' }}>
          从复杂攻略到严谨科普，每一张画作都是 AI 深度理解与艺术表达的完美结晶。
        </p>
      </div>
      <div style={{ background: '#fff', borderRadius: '32px', padding: '60px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ paddingRight: '20px' }}>
            <div style={{ color: '#e66b33', fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE 01</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1a1a1a', lineHeight: '1.2' }}>复杂长图排版能力</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
              支持超长纵向画布输出，精准处理数千字的逻辑排版。无论是旅游攻略、购物清单还是工作流设计，都能做到字体清晰、布局优雅。
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['高清输出', '文字精准', '逻辑理解'].map(tag => (
                <span key={tag} style={{ background: '#e66b3308', border: '1px solid #e66b3315', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#e66b33', fontWeight: '600' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setPreviewImage('/showcase/2.png')}
          >
            <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Maximize2 size={20} color="#e66b33" />
            </div>
            <img src="/showcase/2.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt="苏州旅游攻略" />
          </div>
        </div>
      </div>

      {/* CASE 02: 知识图谱 */}
      <div style={{ background: '#fafafa', borderRadius: '32px', padding: '60px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setPreviewImage('/showcase/3.png')}
          >
            <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Maximize2 size={20} color="#3b82f6" />
            </div>
            <img src="/showcase/3.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt="大语言模型科普" />
          </div>
          <div style={{ paddingLeft: '20px' }}>
            <div style={{ color: '#3b82f6', fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE 02</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1a1a1a', lineHeight: '1.2' }}>知识图谱海报生成</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
              GPT Image V2 能够深度理解深奥的科学概念，并将其转化为极具亲和力的视觉语言。科普教育不再枯燥，每一处插画都精准契合知识点。
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['科普海报', '色彩柔和', '信息可视化'].map(tag => (
                <span key={tag} style={{ background: '#3b82f608', border: '1px solid #3b82f615', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CASE 03: 凡人修仙传 */}
      <div style={{ background: '#fff', borderRadius: '32px', padding: '60px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ paddingRight: '20px' }}>
            <div style={{ color: '#8b5cf6', fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE 03</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1a1a1a', lineHeight: '1.2' }}>中文字体与海报设计</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
              攻克了 AI 绘图领域最难的中文字体精准排版。无论是武侠仙侠、科幻电影还是品牌商业海报，都能实现极具震撼力的标题呈现与意境融合。
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['仙侠风格', '精准中文字体', '意境融合'].map(tag => (
                <span key={tag} style={{ background: '#8b5cf608', border: '1px solid #8b5cf615', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#8b5cf6', fontWeight: '600' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setPreviewImage('/showcase/image.png')}
          >
            <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Maximize2 size={20} color="#8b5cf6" />
            </div>
            <img src="/showcase/image.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt="凡人修仙传海报" />
          </div>
        </div>
      </div>

      {/* CASE 04: 逻辑与学术图表 */}
      <div style={{ background: '#fafafa', borderRadius: '32px', padding: '60px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setPreviewImage('/showcase/5.png')}
          >
            <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Maximize2 size={20} color="#ec4899" />
            </div>
            <img src="/showcase/5.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt="学术逻辑图表" />
          </div>
          <div style={{ paddingLeft: '20px' }}>
            <div style={{ color: '#ec4899', fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE 04</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1a1a1a', lineHeight: '1.2' }}>学术图表与复杂公式</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
              只需输入正文逻辑和图表需求，GPT Image 2 即可生成排版完美的学术流程图或逻辑架构图。不再有乱码，只有严谨的结构与专业级设计。
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['逻辑架构', '无乱码排版', '学术生产力'].map(tag => (
                <span key={tag} style={{ background: '#ec489908', border: '1px solid #ec489915', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#ec4899', fontWeight: '600' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CASE 05: 极致细节 */}
      <div style={{ background: '#fff', borderRadius: '32px', padding: '60px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ paddingRight: '20px' }}>
            <div style={{ color: '#10b981', fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE 05</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1a1a1a', lineHeight: '1.2' }}>极致微距细节</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
              支持超高分辨率渲染，对瞳孔倒影、发丝细节、材质纹理有着极其恐怖的还原力。每一像素都经得起无限放大，是专业插画师的首选。
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['微距画质', '纹理还原', '商业级别'].map(tag => (
                <span key={tag} style={{ background: '#10b98108', border: '1px solid #10b98115', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setPreviewImage('/showcase/1.png')}
          >
            <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Maximize2 size={20} color="#10b981" />
            </div>
            <img src="/showcase/1.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt="细节展示" />
          </div>
        </div>
      </div>

      {/* CASE 06: 创意海报设计 */}
      <div style={{ background: '#fafafa', borderRadius: '32px', padding: '60px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div 
            style={{ cursor: 'zoom-in', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => setPreviewImage('/showcase/4.png')}
          >
            <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '50%', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Maximize2 size={20} color="#f59e0b" />
            </div>
            <img src="/showcase/4.png" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} alt="创意海报展示" />
          </div>
          <div style={{ paddingLeft: '20px' }}>
            <div style={{ color: '#f59e0b', fontWeight: '800', marginBottom: '12px', fontSize: '13px', letterSpacing: '3px' }}>CASE 06</div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: '#1a1a1a', lineHeight: '1.2' }}>创意海报与构图艺术</h2>
            <p style={{ color: '#666', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
              通过对构图学与色彩心理学的深度理解，GPT Image V2 能自动生成极具冲击力的海报作品。无论是极简主义还是繁复美学，都能精准拿拿捏。
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['构图艺术', '色彩冲突', '创意排版'].map(tag => (
                <span key={tag} style={{ background: '#f59e0b08', border: '1px solid #f59e0b15', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
