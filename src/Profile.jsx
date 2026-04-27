import React, { useState, useEffect } from 'react';
import { 
  User, Settings, BookOpen, Clock, Heart, 
  ChevronRight, Edit3, Shield, Star, LogOut
} from 'lucide-react';

export default function Profile({ showToast, profile, setProfile, onLogout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 從資料庫取得閱讀紀錄
    fetch('http://localhost:3001/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleEditName = async () => {
    if (!profile) return;
    
    const newName = window.prompt('請輸入新的使用者名稱：', profile.username);
    if (newName && newName.trim() !== '' && newName !== profile.username) {
      try {
        const response = await fetch(`http://localhost:3001/users/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newName.trim() })
        });
        
        if (response.ok) {
          const updatedProfile = await response.json();
          // 更新 React 狀態，畫面會即時同步
          setProfile(updatedProfile);
          showToast('✅ 名稱已成功更新至資料庫！');
        } else {
          showToast('❌ 更新失敗，請稍後再試');
        }
      } catch (err) {
        showToast('❌ 更新失敗，請確認資料庫伺服器是否執行中');
      }
    }
  };

  if (!profile) return null;

  // 動態讀取加入時間與狀態
  const joinDateStr = profile.joinDate || '2023-10-01';
  const stats = [
    { label: '閱讀時長', value: profile.stats?.readingTime || '120 小時' },
    { label: '看過書籍', value: profile.stats?.booksRead || '45 本' },
    { label: '收藏數量', value: `${(profile.bookmarks || []).length} 本` }
  ];

  return (
    <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* 使用者資訊頭部 */}
      <div className="profile-header" style={{ display: 'flex', gap: '24px', backgroundColor: 'var(--card-bg)', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div className="profile-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
          <User size={48} />
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          <div className="profile-name" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
            {profile.username}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            ID: {profile.id} • 加入時間：{joinDateStr}
          </div>
          <div className="profile-stats" style={{ display: 'flex', gap: '32px' }}>
            {stats.map((stat, idx) => (
              <div className="stat-item" key={idx}>
                <div className="stat-value" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stat.value}</div>
                <div className="stat-label" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="pick-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}
            onClick={handleEditName}
          >
            <Edit3 size={16} /> 編輯名稱
          </button>
          <button 
            className="pick-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', borderColor: '#ef4444', color: '#ef4444' }}
            onClick={onLogout}
          >
            <LogOut size={16} /> 登出帳號
          </button>
        </div>
      </div>

      {/* 設定與導覽卡片 (已移除錢包與 VIP 區塊) */}
      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '32px' }}>
        <div className="setting-card" onClick={() => showToast('帳號安全設定開發中...')} style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
          <div className="setting-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '12px', marginRight: '16px' }}>
            <Shield size={24} />
          </div>
          <div className="setting-content" style={{ flex: 1 }}>
            <div className="setting-title" style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-primary)' }}>帳號與安全</div>
            <div className="setting-desc" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>密碼修改與登入設備管理</div>
          </div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </div>

        <div className="setting-card" onClick={() => showToast('系統偏好設定開發中...')} style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
          <div className="setting-icon" style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '12px', marginRight: '16px' }}>
            <Settings size={24} />
          </div>
          <div className="setting-content" style={{ flex: 1 }}>
            <div className="setting-title" style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-primary)' }}>偏好設定</div>
            <div className="setting-desc" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>閱讀主題背景、字體大小調整</div>
          </div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </div>
      </div>

      <div style={{ marginTop: '40px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        <Clock size={20} color="var(--primary-color)" /> 最近閱讀紀錄
      </div>

      {/* 閱讀紀錄清單 */}
      <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>載入資料庫中...</div>
        ) : history.length > 0 ? (
          history.map((item) => (
            <div className="history-item" key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <img src={`https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150&sig=${item.id}`} alt="Cover" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              <div className="history-info" style={{ flex: 1 }}>
                <div className="history-title" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</div>
                <div className="history-meta" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>閱讀進度：{item.progress}</div>
                <div className="history-time" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>上次閱讀：{item.lastRead}</div>
              </div>
              <button className="pick-btn" onClick={() => showToast(`跳轉至《${item.title}》閱讀頁面`)}>繼續閱讀</button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
            目前還沒有閱讀紀錄喔！
          </div>
        )}
      </div>
    </div>
  );
}
