import React, { useState, useEffect } from 'react';
import { Bookmark, Star, BookOpen } from 'lucide-react';

export default function BookmarkList({ currentUser, onNovelClick, showToast }) {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    fetch('http://localhost:3001/novels')
      .then(res => res.json())
      .then(data => {
        // 從資料庫所有書本中，過濾出該使用者的收藏名單
        const bookmarked = data.filter(n => (currentUser.bookmarks || []).includes(n.id));
        setNovels(bookmarked);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 無法載入收藏清單');
        setIsLoading(false);
      });
  }, [currentUser, showToast]);

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <Bookmark size={48} style={{ opacity: 0.5, marginBottom: '16px', margin: '0 auto' }} />
        <h2>登入後即可查看專屬的收藏清單</h2>
      </div>
    );
  }

  return (
    <div className="category-browse-container" style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Bookmark size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>我的收藏清單</h2>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>載入中...</div>
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
                <div className="rating-badge">
                  <Star size={12} fill="currentColor" /> {novel.likes > 0 ? (novel.likes / 10).toFixed(1) : '新書'}
                </div>
              </div>
              <div className="item-title">{novel.title}</div>
              <div className="item-meta">
                {novel.authorName} · {novel.tag}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
          <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>收藏清單空空如也</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>快去分類瀏覽發掘好書，把它們加入您的專屬書櫃吧！</p>
        </div>
      )}
    </div>
  );
}
