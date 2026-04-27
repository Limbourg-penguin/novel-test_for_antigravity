import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, ChevronRight } from 'lucide-react';

export default function CommunityBrowser({ onChatClick, showToast }) {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/novels')
      .then(res => res.json())
      .then(data => {
        setNovels(data);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 無法載入社群大廳');
        setIsLoading(false);
      });
  }, [showToast]);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <MessageCircle size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>書友交流大廳</h2>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>載入群組中...</div>
      ) : novels.length > 0 ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {novels.map(novel => {
            const chatCount = (novel.groupChat || []).length;
            return (
              <div 
                key={novel.id}
                onClick={() => onChatClick(novel)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px', 
                  backgroundColor: 'var(--card-bg)', borderRadius: '12px', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid var(--border-color)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  {novel.coverImage ? <img src={novel.coverImage} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="cover"/> : novel.title.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>《{novel.title}》專屬討論群</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} /> 粉絲聚集地 · 最新發言：{chatCount > 0 ? new Date((novel.groupChat || [])[chatCount-1].createdAt).toLocaleDateString() : '尚未開始'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{chatCount}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>則討論</div>
                  </div>
                  <ChevronRight size={24} color="var(--text-secondary)" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>目前還沒有任何作品交流群。</div>
      )}
    </div>
  );
}
