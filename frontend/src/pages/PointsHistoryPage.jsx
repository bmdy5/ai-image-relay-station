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
      // 同时获取消费记录和充值记录
      const [consumptionLogs, rechargeLogs] = await Promise.all([
        request.get('/user/consumption'),
        request.get('/user/recharge/history')
      ]);

      // 格式化并合并
      const formattedConsumption = consumptionLogs.map(item => ({
        ...item,
        type: 'consumption',
        display_amount: `-${item.cost_points}`,
        display_label: item.prompt || '生图消耗',
        color: '#ff4d4f'
      }));

      const formattedRecharge = rechargeLogs.map(item => ({
        ...item,
        type: 'recharge',
        display_amount: `+${item.amount}`,
        display_label: `充值到账 (¥${item.money_amount || 0})`,
        color: '#52c41a'
      }));

      const combined = [...formattedConsumption, ...formattedRecharge].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setHistory(combined);
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
          <ClipboardList size={24} color="#e66b33" /> 积分明细
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
                  <th style={{ padding: '12px 8px' }}>变动</th>
                  <th style={{ padding: '12px 8px' }}>描述</th>
                  <th style={{ padding: '12px 8px' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={`${item.type}-${item.id}`} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 8px', color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: item.color }}>
                      {item.display_amount}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.display_label}>
                        {item.display_label}
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
                        {item.status === 'pending' && '已提交'}
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
