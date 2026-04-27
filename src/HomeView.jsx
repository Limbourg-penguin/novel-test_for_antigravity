import React, { useState, useEffect } from 'react';
import { Star, Heart, PawPrint, BookOpen, ChevronRight } from 'lucide-react';

export default function HomeView({ activeTag, showToast, onNovelClick }) {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:3001/novels')
      .then(res => res.json())
      .then(data => {
        setNovels(data);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 無法載入首頁資料');
        setIsLoading(false);
      });
  }, [showToast]);

  // 今日精選：挑選資料庫中最新或按讚數最高的書 (此處以按讚數/字數為排序邏輯示範)
  const todaysPick = novels.length > 0 
    ? [...novels].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] 
    : null;

  // 為你推薦：根據左側過濾標籤動態過濾
  let recommendedNovels = novels;
  if (activeTag) {
    recommendedNovels = novels.filter(n => n.tag === activeTag);
  }
  // 首頁最多顯示 8 本
  recommendedNovels = recommendedNovels.slice(0, 8);

  return (
    <>
      <div className="hero-layout">
        <div className="hero-banner">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200" alt="Banner" style={{ opacity: 0.8 }} />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">找到屬於你的<br/>命定故事！</h1>
            <p className="hero-subtitle">根據你的喜好，探索無數精彩的小說世界</p>
            <button className="hero-btn" onClick={() => showToast('已為您過濾出專屬推薦書單！')}>
              開始探索 <PawPrint size={18} />
            </button>
          </div>
        </div>

        <div className="side-cards">
          <div className="side-card">
            <div className="card-header">
              <Star className="icon" size={18} />
              <span>今日幸運星</span>
            </div>
            <div className="lucky-cat-content">
              <div className="lucky-text">
                今天的運勢超棒！<br/>很適合發掘新書喔～
                <div className="stars">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} />
                </div>
              </div>
              <div style={{ fontSize: '48px', cursor: 'pointer', transition: 'transform 0.2s', userSelect: 'none' }} 
                   onClick={(e) => { 
                     e.currentTarget.style.transform = 'scale(1.2) rotate(10deg)'; 
                     setTimeout(() => e.currentTarget.style.transform = 'scale(1) rotate(0deg)', 200); 
                     showToast('幸運值 +1 ! ✨'); 
                   }}
                   title="點擊我！"
              >
                🦊
              </div>
            </div>
          </div>

          <div className="side-card">
            <div className="card-header">
              <Heart className="icon" size={18} />
              <span>今日精選</span>
            </div>
            {todaysPick ? (
              <div className="todays-pick-content">
                {todaysPick.coverImage ? (
                  <img className="pick-cover" src={todaysPick.coverImage} alt="Cover" />
                ) : (
                  <div className="pick-cover" style={{ 
                    background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold'
                  }}>
                    {todaysPick.title.charAt(0)}
                  </div>
                )}
                <div className="pick-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div className="pick-title" style={{ marginBottom: '4px' }}>{todaysPick.title}</div>
                    <div className="pick-rating-row" style={{ marginBottom: '8px' }}>
                      <div className="pick-rating">
                        <Star size={12} fill="currentColor" /> {todaysPick.likes > 0 ? (todaysPick.likes/10).toFixed(1) : '9.0'}
                      </div>
                      <span className="pick-tags">{todaysPick.tag}</span>
                    </div>
                    <div className="pick-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-secondary)' }}>
                      {todaysPick.description || '作者尚未填寫簡介。'}
                    </div>
                  </div>
                  <button className="pick-btn" onClick={() => onNovelClick(todaysPick)}>開始閱讀</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>尚無書籍</div>
            )}
          </div>
        </div>
      </div>

      <div className="recommended-section">
        <div className="section-header">
          <div className="section-title">
            <BookOpen className="icon" size={24} />
            為你推薦
            <span className="subtitle">{activeTag ? `正在顯示「${activeTag}」相關作品` : '根據您的喜好隨機推薦'}</span>
          </div>
          <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); showToast('目前已顯示所有相關書籍'); }}>查看全部 <ChevronRight size={16} /></a>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>載入中...</div>
        ) : recommendedNovels.length > 0 ? (
          <div className="grid-container">
            {recommendedNovels.map((novel) => (
              <div className="grid-item" key={novel.id} onClick={() => onNovelClick(novel)}>
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
                    <Star size={12} fill="currentColor" /> {novel.likes > 0 ? (novel.likes/10).toFixed(1) : '新書'}
                  </div>
                </div>
                <div className="item-title">{novel.title}</div>
                <div className="item-meta">{novel.authorName} · {novel.tag}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>沒有符合「{activeTag}」分類的推薦書籍，您或許可以成為第一位作者？</p>
          </div>
        )}
      </div>
    </>
  );
}
