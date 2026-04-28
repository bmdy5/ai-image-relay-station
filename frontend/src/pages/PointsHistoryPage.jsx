import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import request from '../api/request';

const PointsHistoryPage = ({ isMobile }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const logs = await request.get('/user/consumption');
      setHistory(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: isMobile ? '20px auto' : '40px auto', padding: '0 20px', paddingBottom: isMobile ? '100px' : '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
        <button 
          onClick={() => navigate('/profile')} 
          style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={24} color="#e66b33" /> 积分消费记录
        </h1>
      </div>

      <div className="card" style={{ padding: '24px', background: '#fff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>加载中...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>时间</th>
                  <th style={{ padding: '12px 8px' }}>消耗</th>
                  <th style={{ padding: '12px 8px' }}>提示词</th>
                  <th style={{ padding: '12px 8px' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 8px', color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>-{item.cost_points}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.prompt}>
                        {item.prompt}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        background: 
                          item.status === 'success' ? '#f6ffed' : 
                          item.status === 'failed' ? '#fff1f0' : '#fff7e6',
                        color: 
                          item.status === 'success' ? '#52c41a' : 
                          item.status === 'failed' ? '#ff4d4f' : '#faad14',
                        border: `1px solid ${
                          item.status === 'success' ? '#b7eb8f' : 
                          item.status === 'failed' ? '#ffa39e' : '#ffe58f'
                        }`
                      }}>
                        {item.status === 'success' && '成功'}
                        {item.status === 'failed' && '失败'}
                        {item.status === 'pending' && '等待中'}
                        {item.status === 'generating' && '生成中'}
                        {item.status === 'storing' && '保存中'}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsHistoryPage;
