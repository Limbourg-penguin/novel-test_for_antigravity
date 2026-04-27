import React, { useState, useEffect } from 'react';
import { Calendar, Star, BookOpen, Sparkles } from 'lucide-react';

export default function NewBooks({ showToast, onNovelClick }) {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:3001/novels')
      .then(res => res.json())
      .then(data => {
        // 依照發布時間倒序排列 (最新的在前)
        data.sort((a, b) => {
           const timeA = new Date(a.publishedAt || Number(a.id)).getTime();
           const timeB = new Date(b.publishedAt || Number(b.id)).getTime();
           return timeB - timeA;
        });
        setNovels(data);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 無法載入新書推薦');
        setIsLoading(false);
      });
  }, [showToast]);

  return (
    <div className="category-browse-container" style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Sparkles size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>近期新書推薦</h2>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>尋找新書中...</div>
      ) : novels.length > 0 ? (
        <div className="grid-container">
          {novels.map(novel => (
            <div 
              className="grid-item" 
              key={novel.id} 
              onClick={() => {
                showToast(`正在前往《${novel.title}》...`);
                if(onNovelClick) onNovelClick(novel);
              }}
            >
              <div className="grid-cover-wrapper">
                {novel.coverImage ? (
                  <img className="grid-cover" src={novel.coverImage} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="grid-cover" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '48px', fontWeight: 'bold', color: 'white',
                    background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
                    width: '100%', height: '100%'
                  }}>
                    {novel.title ? novel.title.charAt(0) : '書'}
                  </div>
                )}
                <div className="rating-badge" style={{ backgroundColor: '#10b981' }}>
                  NEW
                </div>
              </div>
              <div className="item-title">{novel.title}</div>
              <div className="item-meta">
                {novel.authorName} · {novel.tag}
              </div>
              <div className="item-meta" style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                {new Date(novel.publishedAt || Number(novel.id)).toLocaleDateString()} 發布
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
          <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>近期尚無新書發布。</p>
        </div>
      )}
    </div>
  );
}
