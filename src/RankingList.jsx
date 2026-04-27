import React, { useState, useEffect } from 'react';
import { Trophy, Star, BookOpen, Crown } from 'lucide-react';

export default function RankingList({ showToast, onNovelClick }) {
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:3001/novels')
      .then(res => res.json())
      .then(data => {
        // 算出每本小說的總字數
        const processed = data.map(n => {
          const totalWords = (n.chapters || []).reduce((acc, ch) => acc + (ch.wordCount || (ch.content?.length || 0)), 0);
          return { ...n, totalWords };
        });
        
        // 根據字數由高到低排序
        processed.sort((a, b) => b.totalWords - a.totalWords);
        setNovels(processed);
        setIsLoading(false);
      })
      .catch(err => {
        showToast('❌ 無法載入排行榜');
        setIsLoading(false);
      });
  }, [showToast]);

  return (
    <div className="category-browse-container" style={{ padding: '12px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Trophy size={28} color="#f59e0b" />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>字數排行榜 (爆肝榜)</h2>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>計算排名中...</div>
      ) : novels.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {novels.map((novel, index) => (
            <div 
              key={novel.id} 
              style={{ 
                display: 'flex', gap: '20px', padding: '16px', backgroundColor: 'var(--card-bg)', 
                borderRadius: '12px', boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                border: '1px solid transparent', transition: 'all 0.2s', alignItems: 'center'
              }}
              onClick={() => {
                showToast(`正在前往《${novel.title}》...`);
                if(onNovelClick) onNovelClick(novel);
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              {/* 名次徽章 */}
              <div style={{ width: '40px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--text-secondary)' }}>
                {index === 0 ? <Crown size={32} /> : index + 1}
              </div>

              {/* 封面 */}
              <div style={{ width: '80px', height: '110px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {novel.coverImage ? (
                  <img src={novel.coverImage} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'white', fontWeight: 'bold' }}>
                    {novel.title ? novel.title.charAt(0) : '書'}
                  </div>
                )}
              </div>

              {/* 書籍資訊 */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)' }}>{novel.title}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>作者：{novel.authorName}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span className="book-card-tag">{novel.tag}</span>
                  <span className="book-card-tag" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
                    共 {(novel.chapters || []).length} 章
                  </span>
                </div>
              </div>

              {/* 總字數顯示 */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {novel.totalWords.toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>字</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
          <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>目前還沒有任何作品，快去發表您的第一本書吧！</p>
        </div>
      )}
    </div>
  );
}
