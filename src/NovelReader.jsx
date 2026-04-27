import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, Share2, BookOpen, ChevronLeft, ChevronRight, List, Settings, MessageCircle, X, Send } from 'lucide-react';

export default function NovelReader({ novel: initialNovel, onBack, showToast, currentUser, onUpdateUser }) {
  const [novel, setNovel] = useState(initialNovel);
  const [view, setView] = useState('INFO'); // 'INFO' | 'READING'
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // 閱讀設定 State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('system-ui, sans-serif');

  // 段落書評 State
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState(null);
  const [commentText, setCommentText] = useState('');

  // 章節總評 State
  const [chapterCommentText, setChapterCommentText] = useState('');

  const chapters = novel.chapters || [];
  const hasChapters = chapters.length > 0;
  
  const currentChapter = hasChapters ? chapters[currentChapterIndex] : null;
  // 將內文拆分成段落
  const paragraphs = currentChapter ? currentChapter.content.split('\n') : [];

  const handleStartReading = () => {
    if (!hasChapters) {
      showToast('⚠️ 這本書還沒有任何章節喔！');
      return;
    }
    setView('READING');
  };

  const handleReadChapter = (index) => {
    setCurrentChapterIndex(index);
    setView('READING');
  };

  const bookmarks = currentUser?.bookmarks || [];
  const isBookmarked = bookmarks.includes(novel.id);

  const handleToggleBookmark = async () => {
    if (!currentUser) {
      showToast('⚠️ 請先登入才能收藏書籍');
      return;
    }

    const newBookmarks = isBookmarked 
      ? bookmarks.filter(id => id !== novel.id) 
      : [...bookmarks, novel.id];

    try {
      const res = await fetch(`http://localhost:3001/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarks: newBookmarks })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        if(onUpdateUser) onUpdateUser(updatedUser);
        showToast(isBookmarked ? '🗑️ 已從收藏清單移除' : '⭐ 已加入收藏清單！');
      }
    } catch(err) {
      showToast('❌ 收藏失敗');
    }
  };

  // 儲存段落書評
  const handleSaveComment = async () => {
    if (!commentText.trim()) return;
    if (!currentUser) {
      showToast('⚠️ 請先登入才能留下書評');
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      paragraphIndex: selectedParagraphIndex,
      text: commentText,
      username: currentUser.username,
      createdAt: new Date().toISOString()
    };

    // 複製並更新本地的 Novel 狀態
    const updatedChapters = [...chapters];
    const chapterToUpdate = { ...updatedChapters[currentChapterIndex] };
    if (!chapterToUpdate.comments) chapterToUpdate.comments = [];
    chapterToUpdate.comments.push(newComment);
    updatedChapters[currentChapterIndex] = chapterToUpdate;

    const updatedNovel = { ...novel, chapters: updatedChapters };
    setNovel(updatedNovel);
    setCommentText('');
    
    // 更新至資料庫
    try {
      await fetch(`http://localhost:3001/novels/${novel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapters: updatedChapters })
      });
      showToast('✅ 段落書評已成功發布！');
    } catch(err) {
      showToast('❌ 儲存段落書評失敗');
    }
  };

  // 儲存章節總評論
  const handleSaveChapterComment = async () => {
    if (!chapterCommentText.trim()) return;
    if (!currentUser) {
      showToast('⚠️ 請先登入才能留下評論');
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      text: chapterCommentText,
      username: currentUser.username,
      createdAt: new Date().toISOString()
    };

    const updatedChapters = [...chapters];
    const chapterToUpdate = { ...updatedChapters[currentChapterIndex] };
    if (!chapterToUpdate.chapterComments) chapterToUpdate.chapterComments = [];
    chapterToUpdate.chapterComments.push(newComment);
    updatedChapters[currentChapterIndex] = chapterToUpdate;

    const updatedNovel = { ...novel, chapters: updatedChapters };
    setNovel(updatedNovel);
    setChapterCommentText('');
    
    try {
      await fetch(`http://localhost:3001/novels/${novel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapters: updatedChapters })
      });
      showToast('✅ 章節討論已成功發布！');
    } catch(err) {
      showToast('❌ 儲存討論失敗');
    }
  };

  // ============== 視圖一：書籍資訊與目錄 ==============
  if (view === 'INFO') {
    return (
      <div className="novel-reader-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <button className="icon-btn-circle" onClick={onBack} style={{ marginBottom: '24px' }}>
          <ArrowLeft size={20} />
        </button>

        {/* 書籍頭部資訊 */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', backgroundColor: 'var(--card-bg)', padding: '32px', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '200px', height: '280px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            {novel.coverImage ? (
              <img src={novel.coverImage} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: 'white', fontWeight: 'bold' }}>
                {novel.title ? novel.title.charAt(0) : '書'}
              </div>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', color: 'var(--text-primary)' }}>{novel.title}</h1>
            <div style={{ fontSize: '16px', color: 'var(--primary-color)', fontWeight: '600', marginBottom: '16px' }}>{novel.authorName}</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <span className="book-card-tag" style={{ padding: '6px 12px', fontSize: '14px' }}>{novel.tag}</span>
              <span className="book-card-tag" style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>{chapters.length} 章</span>
              <span className="book-card-tag" style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Star size={14} /> {novel.likes > 0 ? (novel.likes/10).toFixed(1) : '新書'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-wrap' }}>
              {novel.description || '作者很神祕，什麼簡介都沒有留下...'}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button className="hero-btn" onClick={handleStartReading} style={{ flex: 1, justifyContent: 'center', fontSize: '16px', padding: '12px' }}>
                <BookOpen size={20} /> {hasChapters ? '開始閱讀' : '作者尚未發布章節'}
              </button>
              <button 
                className="pick-btn" 
                onClick={handleToggleBookmark}
                title={isBookmarked ? '取消收藏' : '加入收藏'}
                style={{ 
                  backgroundColor: isBookmarked ? 'var(--primary-light)' : 'transparent',
                  color: isBookmarked ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderColor: isBookmarked ? 'var(--primary-color)' : 'var(--border-color)',
                  transition: 'all 0.2s'
                }}
              >
                {isBookmarked ? <Heart size={20} fill="currentColor" /> : <Heart size={20} />}
              </button>
              <button className="pick-btn" onClick={() => showToast('分享連結已複製到剪貼簿！')}><Share2 size={20} /></button>
            </div>
          </div>
        </div>

        {/* 目錄清單 */}
        <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-primary)' }}>章節目錄</h2>
        {hasChapters ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {chapters.map((ch, idx) => (
              <div 
                key={ch.id} 
                style={{ padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
                onClick={() => handleReadChapter(idx)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>第 {idx + 1} 章：{ch.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {ch.wordCount || (ch.content?.length || 0)} 字 · {new Date(ch.updatedAt || novel.publishedAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
            作者正在努力碼字中，敬請期待！
          </div>
        )}
      </div>
    );
  }

  // ============== 視圖二：沉浸式閱讀器與段落互動 ==============
  if (view === 'READING' && currentChapter) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* 閱讀器頂部導覽列 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'sticky', top: '0', backgroundColor: 'var(--bg-color)', padding: '16px 0', zIndex: 10, borderBottom: '1px solid var(--border-color)' }}>
          <button className="icon-btn-circle" onClick={() => setView('INFO')} title="返回目錄">
            <List size={20} />
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{novel.title}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>第 {currentChapterIndex + 1} 章</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn-circle" onClick={() => setShowSettings(!showSettings)} title="閱讀設定">
              <Settings size={20} />
            </button>
            
            {/* 字體設定彈窗 */}
            {showSettings && (
              <div style={{ 
                position: 'absolute', right: 0, top: '48px', 
                backgroundColor: 'var(--card-bg)', padding: '16px', 
                borderRadius: '8px', boxShadow: 'var(--shadow-md)', 
                width: '240px', zIndex: 100, border: '1px solid var(--border-color)' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>閱讀設定</h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>字體大小</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[14, 16, 18, 20, 24].map(size => (
                      <button 
                        key={size}
                        onClick={() => setFontSize(size)}
                        style={{ 
                          flex: 1, padding: '4px', borderRadius: '4px', 
                          backgroundColor: fontSize === size ? 'var(--primary-color)' : 'var(--bg-color)',
                          color: fontSize === size ? 'white' : 'var(--text-primary)',
                          border: 'none', cursor: 'pointer'
                        }}
                      >
                        {size === 18 ? '預設' : size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>字體樣式</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => setFontFamily('system-ui, sans-serif')} style={{ padding: '8px', borderRadius: '4px', textAlign: 'left', backgroundColor: fontFamily === 'system-ui, sans-serif' ? 'var(--primary-light)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>無襯線體 (預設)</button>
                    <button onClick={() => setFontFamily('"Noto Serif TC", serif')} style={{ padding: '8px', borderRadius: '4px', textAlign: 'left', backgroundColor: fontFamily === '"Noto Serif TC", serif' ? 'var(--primary-light)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontFamily: '"Noto Serif TC", serif' }}>襯線體 (文藝)</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 動態內文區塊 */}
        <div style={{ flex: 1, padding: '0 20px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '40px', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 'bold' }}>
            {currentChapter.title}
          </h1>
          
          <div style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily, lineHeight: '2.0', color: 'var(--text-primary)', textAlign: 'justify', letterSpacing: '0.5px' }}>
            {paragraphs.length > 0 ? paragraphs.map((p, idx) => {
              if (p.trim() === '') return <br key={idx} />;
              
              const pComments = (currentChapter.comments || []).filter(c => c.paragraphIndex === idx);
              const isSelected = selectedParagraphIndex === idx;

              return (
                <div 
                  key={idx} 
                  style={{ 
                    position: 'relative', 
                    marginBottom: '16px', 
                    padding: '8px', 
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => setSelectedParagraphIndex(isSelected ? null : idx)}
                  title="點擊段落留下書評"
                >
                  {p}
                  
                  {/* 書評數量氣泡 (當未展開且有書評時顯示) */}
                  {pComments.length > 0 && !isSelected && (
                    <span style={{ 
                      position: 'absolute', right: '-40px', top: '10px', 
                      fontSize: '12px', color: 'var(--primary-color)', 
                      backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <MessageCircle size={12} /> {pComments.length}
                    </span>
                  )}

                  {/* 展開的段落書評介面 */}
                  {isSelected && (
                    <div style={{ 
                      marginTop: '16px', padding: '16px', 
                      backgroundColor: 'var(--card-bg)', borderRadius: '8px', 
                      boxShadow: 'var(--shadow-sm)', cursor: 'default'
                    }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                          <MessageCircle size={16} /> 段落書評 ({pComments.length})
                        </h4>
                        <button className="icon-btn-small" onClick={() => setSelectedParagraphIndex(null)}><X size={16}/></button>
                      </div>

                      {/* 歷史書評列表 */}
                      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pComments.map(c => (
                          <div key={c.id} style={{ backgroundColor: 'var(--bg-color)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '4px' }}>{c.username}</div>
                            <div style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{c.text}</div>
                          </div>
                        ))}
                        {pComments.length === 0 && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>尚無人發表想法，來搶頭香吧！</div>}
                      </div>

                      {/* 輸入留言 */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder={currentUser ? "寫下你的想法..." : "請先登入才能留言"}
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          disabled={!currentUser}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-color)', fontSize: '13px', color: 'var(--text-primary)' }}
                          onKeyDown={e => { if(e.key === 'Enter') handleSaveComment(); }}
                        />
                        <button 
                          className="hero-btn" 
                          style={{ padding: '8px', borderRadius: '50%' }}
                          onClick={handleSaveComment}
                          disabled={!currentUser || !commentText.trim()}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : '（本章無內容）'}
          </div>
        </div>

        {/* 章節總評論區塊 (讀完一章後的綜合討論) */}
        <div style={{ marginTop: '80px', padding: '0 20px' }}>
          <h3 style={{ fontSize: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} /> 本章討論區 ({(currentChapter.chapterComments || []).length})
          </h3>
          
          {/* 輸入評論區 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 'bold', flexShrink: 0 }}>
              {currentUser ? currentUser.username.charAt(0) : '?'}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea 
                placeholder={currentUser ? "發表您對這一章的整體看法或心得..." : "請先登入才能發表討論"}
                value={chapterCommentText}
                onChange={e => setChapterCommentText(e.target.value)}
                disabled={!currentUser}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="hero-btn" 
                  onClick={handleSaveChapterComment}
                  disabled={!currentUser || !chapterCommentText.trim()}
                  style={{ padding: '8px 24px', opacity: (!currentUser || !chapterCommentText.trim()) ? 0.5 : 1 }}
                >
                  發布評論
                </button>
              </div>
            </div>
          </div>

          {/* 歷史評論列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(currentChapter.chapterComments || []).length > 0 ? (
              (currentChapter.chapterComments || []).map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 'bold', flexShrink: 0 }}>
                    {comment.username.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{comment.username}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                      {comment.text}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                這章還沒有人參與討論，搶先發表您的第一筆心得吧！
              </div>
            )}
          </div>
        </div>

        {/* 閱讀器底部換頁導覽 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '24px', borderTop: '1px dashed var(--border-color)' }}>
          <button 
            className="pick-btn" 
            disabled={currentChapterIndex === 0}
            onClick={() => {
              setCurrentChapterIndex(prev => prev - 1);
              setSelectedParagraphIndex(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ opacity: currentChapterIndex === 0 ? 0.3 : 1, cursor: currentChapterIndex === 0 ? 'not-allowed' : 'pointer', padding: '12px 24px' }}
          >
            <ChevronLeft size={20} /> 上一章
          </button>
          
          <button className="pick-btn" onClick={() => setView('INFO')} style={{ padding: '12px 24px' }}>
            <List size={20} /> 回目錄
          </button>

          <button 
            className="hero-btn" 
            disabled={currentChapterIndex === chapters.length - 1}
            onClick={() => {
              setCurrentChapterIndex(prev => prev + 1);
              setSelectedParagraphIndex(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ opacity: currentChapterIndex === chapters.length - 1 ? 0.3 : 1, cursor: currentChapterIndex === chapters.length - 1 ? 'not-allowed' : 'pointer', padding: '12px 24px' }}
          >
            下一章 <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
