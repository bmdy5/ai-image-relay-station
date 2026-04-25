import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  PencilLine, 
  Settings2, 
  Palette, 
  Lightbulb,
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const GuidePage = () => {
  const navigate = useNavigate();

  const steps = [
    { 
      title: '描述创意', 
      icon: <PencilLine size={24} />, 
      desc: '在输入框中输入您想要生成的画面描述。中英文皆可，描述越具体，效果越理想。',
      tip: '建议包含：主体 + 场景 + 艺术风格 + 光影。'
    },
    { 
      title: '调节参数', 
      icon: <Settings2 size={24} />, 
      desc: '根据需要选择图片比例（1:1, 4:3 等）和生成数量。更高的质量会消耗更多积分。',
      tip: '横屏适合风景，竖屏适合人像。'
    },
    { 
      title: '魔法生成', 
      icon: <Palette size={24} />, 
      desc: '点击生成按钮，稍等片刻，AI 将把您的文字转化为惊艳的视觉艺术。',
      tip: '您可以随时在“我的创作”中查看和下载历史作品。'
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', animation: 'fadeIn 0.5s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}
        >
          <ArrowLeft size={20} /> 返回首页
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', flex: 1 }}>使用指南</h1>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* 新手教学 */}
      <section style={{ marginBottom: '60px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={22} color="#e66b33" /> 三步开始创作
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, index) => (
            <div key={step.title} className="card" style={{ display: 'flex', gap: '25px', padding: '25px', alignItems: 'flex-start' }}>
              <div style={{ 
                background: '#fff7e6', color: '#e66b33', width: '50px', height: '50px', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ color: '#e66b33', fontWeight: 'bold', fontSize: '18px' }}>0{index + 1}</span>
                  <h4 style={{ fontSize: '18px', margin: 0 }}>{step.title}</h4>
                </div>
                <p style={{ color: '#666', lineHeight: '1.6', margin: '0 0 10px 0' }}>{step.desc}</p>
                <div style={{ fontSize: '13px', background: '#f9f9f9', padding: '8px 12px', borderRadius: '6px', color: '#888', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={14} color="#fadb14" /> <strong>小贴士：</strong> {step.tip}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{ alignSelf: 'center', color: '#eee' }}>
                  <ChevronRight size={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 提示词技巧 */}
      <section className="card" style={{ padding: '30px', marginBottom: '60px', background: 'linear-gradient(135deg, #fff 0%, #fffbf5 100%)' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} color="#e66b33" /> 提示词 (Prompt) 实验室
        </h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>想要获得更精美的图片？试试这个黄金公式：</p>
        <div style={{ 
          background: '#333', color: '#eee', padding: '20px', borderRadius: '12px', 
          fontFamily: 'monospace', lineHeight: '1.8', fontSize: '15px'
        }}>
          <span style={{ color: '#ff9c6e' }}>[主体描述]</span> + <span style={{ color: '#95de64' }}>[场景/细节]</span> + <span style={{ color: '#597ef7' }}>[艺术风格]</span> + <span style={{ color: '#ffd666' }}>[光影/质量词]</span>
          <br />
          <div style={{ marginTop: '10px', color: '#888', fontSize: '13px' }}>
            // 示例：一只可爱的橘猫 + 坐在窗台看雨 + 吉卜力风格 + 柔和室内光, 8k 超清
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h3 style={{ fontSize: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HelpCircle size={22} color="#e66b33" /> 常见问题
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[
            { q: '生成的图片可以商用吗？', a: '所有通过本站生成的图片版权均归属于创作者（用户），您可以根据所选套餐的授权范围进行使用。' },
            { q: '为什么图片生成失败了？', a: '可能是由于提示词触发了内容安全过滤，或者您的积分余额不足。如果持续失败，请联系管理员。' },
            { q: '支持退款或积分找回吗？', a: '由于 AI 生成属于算力消耗型服务，生成成功后不支持退款。若因系统故障导致生成失败但扣除了积分，系统会自动返还。' }
          ].map(faq => (
            <div key={faq.q} style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '16px' }}>Q: {faq.q}</div>
              <div style={{ color: '#666', lineHeight: '1.6' }}>A: {faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '40px' }}>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/')}
          style={{ padding: '12px 40px' }}
        >
          立即开启创作
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card { transition: transform 0.3s ease, box-shadow 0.3s ease; border: 1px solid #f0f0f0; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(0,0,0,0.05); }
      `}} />
    </div>
  );
};

export default GuidePage;
