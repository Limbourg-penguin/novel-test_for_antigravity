import React, { useState, useEffect } from 'react';
import { LayoutGrid, Star, BookOpen } from 'lucide-react';

export default function CategoryBrowser({ showToast, onNovelClick }) {
  const [novels, setNovels] = useState([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [isLoading, setIsLoading] = useState(true);

  // 常見的標籤分類
  const categories = ['全部', '奇幻', '戀愛', '校園', '戰鬥', '日常', '科幻', '懸疑', '治癒'];

  useEffect(() => {
    setIsLoading(true);
    // 讀取資料庫中所有發布的小說
    fetch('http://localhost:3001/novels')
      .then(res => res.json())
      .then(data => {
        setNovels(data);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 無法載入書籍資料');
        setIsLoading(false);
      });
  }, [showToast]);

  const filteredNovels = activeCategory === '全部' 
    ? novels 
    : novels.filter(n => n.tag === activeCategory);

  return (
    <div className="category-browse-container" style={{ padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <LayoutGrid size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>分類瀏覽</h2>
      </div>

      {/* 標籤過濾器 */}
      <div className="category-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`tag-btn ${activeCategory === cat ? 'active' : ''}`}
            style={{
              padding: '8px 20px',
              fontSize: '15px',
              backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'var(--card-bg)',
              color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: activeCategory === cat ? 'var(--primary-color)' : 'var(--border-color)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 小說列表 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>正在從資料庫載入書單...</div>
      ) : filteredNovels.length > 0 ? (
        <div className="grid-container">
          {filteredNovels.map(novel => (
            <div 
              className="grid-item" 
              key={novel.id} 
              onClick={() => {
                showToast(`正在前往《${novel.title}》的閱讀頁面...`);
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
              <div className="item-meta" style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                共 {(novel.chapters || []).length} 章
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
          <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>找不到此分類的作品</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>目前「{activeCategory}」分類還沒有任何書籍。<br/>也許您可以前往作家助手，成為第一個撰寫此類別的作者！</p>
        </div>
      )}
    </div>
  );
}
