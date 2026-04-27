import React, { useState, useEffect } from 'react';
import { Search, Star, BookOpen } from 'lucide-react';

export default function SearchResults({ query, onNovelClick, showToast }) {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setNovels([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // 利用 json-server 的全文檢索功能 (q=xxx)
    fetch(`http://localhost:3001/novels?q=${encodeURIComponent(query.trim())}`)
      .then(res => res.json())
      .then(data => {
        setNovels(data);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 搜尋發生錯誤');
        setIsLoading(false);
      });
  }, [query, showToast]);

  return (
    <div className="category-browse-container" style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Search size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
          搜尋結果：<span style={{ color: 'var(--primary-color)' }}>{query}</span>
        </h2>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>正在搜尋中...</div>
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
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>找不到相關作品</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>試試看更換其他關鍵字，或是輸入作者名稱來搜尋。</p>
        </div>
      )}
    </div>
  );
}
