import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Save, Send, Image as ImageIcon, Plus, 
  MessageSquare, Settings, ChevronRight, Hash, 
  ArrowLeft, Book, Clock, Edit3, MoreVertical
} from 'lucide-react';

export default function AuthorAssistant({ showToast, currentUser }) {
  // Layer states: 'LIBRARY' -> 'DASHBOARD' -> 'EDITOR'
  const [layer, setLayer] = useState('LIBRARY');
  
  const [novels, setNovels] = useState([]);
  const [selectedNovel, setSelectedNovel] = useState(null);
  
  // Book Info Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('奇幻');
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Editor States
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [content, setContent] = useState('');

  const [dashboardTab, setDashboardTab] = useState('chapters');

  useEffect(() => {
    if (currentUser) {
      fetchNovels();
    }
  }, [currentUser]);

  const fetchNovels = () => {
    fetch(`http://localhost:3001/novels?authorId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setNovels(data));
  };

  const handleCreateNewBook = () => {
    setSelectedNovel(null);
    setTitle('');
    setDescription('');
    setTag('奇幻');
    setCoverImage(null);
    setLayer('DASHBOARD');
  };

  const handleSelectBook = (novel) => {
    // 相容舊資料結構，將舊版的單一章節轉為陣列格式
    const migratedNovel = { ...novel };
    if (!migratedNovel.chapters && migratedNovel.chapterTitle) {
      migratedNovel.chapters = [{
        id: 'legacy-1',
        title: migratedNovel.chapterTitle,
        content: migratedNovel.content || '',
        status: 'published',
        wordCount: (migratedNovel.content || '').length
      }];
    } else if (!migratedNovel.chapters) {
      migratedNovel.chapters = [];
    }

    setSelectedNovel(migratedNovel);
    setTitle(migratedNovel.title || '');
    setDescription(migratedNovel.description || '');
    setTag(migratedNovel.tag || '奇幻');
    setCoverImage(migratedNovel.coverImage || null);
    setLayer('DASHBOARD');
  };

  // 處理圖片上傳預覽
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        showToast('⚠️ 圖片檔案過大，請上傳小於 2MB 的圖片');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
        showToast('✅ 圖片已成功載入，請記得點擊儲存！');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBookInfo = async () => {
    if (!title.trim()) {
      showToast('⚠️ 書名不能為空！');
      return;
    }
    
    const novelData = {
      authorId: currentUser.id,
      authorName: currentUser.username,
      title,
      description,
      tag,
      coverImage,
      chapters: selectedNovel ? selectedNovel.chapters : [], // 保留章節資料
      publishedAt: selectedNovel ? selectedNovel.publishedAt : new Date().toISOString(),
      likes: selectedNovel ? selectedNovel.likes : 0,
      views: selectedNovel ? selectedNovel.views : 0
    };

    if (!selectedNovel || !selectedNovel.id) {
      novelData.id = Date.now().toString();
      const res = await fetch('http://localhost:3001/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novelData)
      });
      if (res.ok) {
        const newNovel = await res.json();
        setSelectedNovel(newNovel);
        fetchNovels();
        showToast('🎉 新書與封面建立成功！現在可以開始寫章節了。');
      }
    } else {
      const res = await fetch(`http://localhost:3001/novels/${selectedNovel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novelData)
      });
      if (res.ok) {
        const updated = await res.json();
        if (!updated.chapters) updated.chapters = novelData.chapters; // 確保有 chapters 陣列
        setSelectedNovel(updated);
        fetchNovels();
        showToast('✅ 書籍資訊已儲存');
      }
    }
  };

  // 章節管理邏輯
  const handleWriteNewChapter = () => {
    if (!selectedNovel || !selectedNovel.id) {
      showToast('⚠️ 請先在左側填寫書名並點擊「儲存書籍資訊」建立書籍，才能開始寫作！');
      return;
    }
    setEditingChapterId(null);
    setChapterTitle('');
    setContent('');
    setLayer('EDITOR');
  };

  const handleEditChapter = (chapter) => {
    setEditingChapterId(chapter.id);
    setChapterTitle(chapter.title);
    setContent(chapter.content || '');
    setLayer('EDITOR');
  };

  const handleSaveEditor = async (publish = false) => {
    if (!selectedNovel || !selectedNovel.id) return;
    
    const newChapter = {
      id: editingChapterId || Date.now().toString(),
      title: chapterTitle || '未命名章節',
      content,
      status: publish ? 'published' : 'draft',
      wordCount: content.length,
      updatedAt: new Date().toISOString()
    };

    let updatedChapters = [...(selectedNovel.chapters || [])];
    if (editingChapterId) {
      // 更新現有章節
      updatedChapters = updatedChapters.map(c => c.id === editingChapterId ? newChapter : c);
    } else {
      // 新增章節
      updatedChapters.push(newChapter);
    }

    const res = await fetch(`http://localhost:3001/novels/${selectedNovel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapters: updatedChapters })
    });

    if (res.ok) {
      const updated = await res.json();
      if (!updated.chapters) updated.chapters = updatedChapters;
      
      setSelectedNovel(updated);
      setEditingChapterId(newChapter.id); // 儲存後將編輯狀態設為該章節
      fetchNovels();
      showToast(publish ? '🎉 章節已成功發布！' : '✅ 內容草稿已儲存');
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <PenTool size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h2>成為作家前，請先登入帳號</h2>
        <p style={{ marginTop: '8px' }}>登入或註冊後，即可在此開始撰寫您的專屬故事！</p>
      </div>
    );
  }

  // ============== 第一層：作品庫 (LIBRARY) ==============
  if (layer === 'LIBRARY') {
    return (
      <div className="author-container">
        <div className="author-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <PenTool size={24} color="var(--primary-color)" /> 我的作品庫
          </h2>
        </div>
        
        <div className="library-grid">
          {/* 建立新書卡片 */}
          <div className="library-card create-card" onClick={handleCreateNewBook}>
            <div className="create-icon-wrapper">
              <Plus size={48} color="var(--primary-color)" />
            </div>
            <div className="create-text">建立新作品</div>
          </div>
          
          {/* 現有書籍圖示 */}
          {novels.map(novel => (
            <div key={novel.id} className="library-card book-card" onClick={() => handleSelectBook(novel)}>
              {novel.coverImage ? (
                <img src={novel.coverImage} alt={novel.title} className="book-card-cover-img" />
              ) : (
                <div className="book-card-cover">
                  {novel.title ? novel.title.charAt(0) : '書'}
                </div>
              )}
              <div className="book-card-info">
                <div className="book-card-title">{novel.title}</div>
                <div className="book-card-meta">
                  <span className="book-card-tag">{novel.tag}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                    共 {(novel.chapters || []).length} 章
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============== 第二層：書籍管理與書評 (DASHBOARD) ==============
  if (layer === 'DASHBOARD') {
    return (
      <div className="author-container">
        <div className="author-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="icon-btn-circle" onClick={() => setLayer('LIBRARY')} title="返回作品庫">
              <ArrowLeft size={20} />
            </button>
            <h2 style={{ margin: 0 }}>{selectedNovel ? '作品管理' : '新增作品'}</h2>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* 左側：書籍資訊 */}
          <div className="workspace-col" style={{ width: '340px', padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>書籍資訊</h3>
            
            {/* 隱藏的上傳元件 */}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
            
            <div 
              className="cover-upload" 
              style={{ 
                height: '200px', 
                marginBottom: '20px',
                backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: coverImage ? 'none' : '2px dashed var(--border-color)',
                overflow: 'hidden'
              }} 
              onClick={() => fileInputRef.current?.click()}
            >
              {!coverImage && (
                <>
                  <ImageIcon size={40} />
                  <span>上傳書籍封面 (限 2MB)</span>
                </>
              )}
            </div>
            
            <div className="input-group-col" style={{ marginBottom: '16px' }}>
              <label>書名</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="input-group-col" style={{ marginBottom: '16px' }}>
              <label>作品分類</label>
              <select value={tag} onChange={e => setTag(e.target.value)} className="editor-select">
                <option value="奇幻">奇幻</option>
                <option value="戀愛">戀愛</option>
                <option value="校園">校園</option>
                <option value="戰鬥">戰鬥</option>
                <option value="懸疑">懸疑</option>
                <option value="科幻">科幻</option>
              </select>
            </div>

            <div className="input-group-col" style={{ marginBottom: '24px' }}>
              <label>作品簡介</label>
              <textarea rows="5" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>

            <button className="hero-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSaveBookInfo}>
              <Save size={18} /> 儲存書籍資訊
            </button>
          </div>

          {/* 右側：章節與書評 */}
          {selectedNovel ? (
            <div className="workspace-col" style={{ flex: 1 }}>
              <div className="workspace-tabs">
                <div className={`w-tab ${dashboardTab === 'chapters' ? 'active' : ''}`} onClick={() => setDashboardTab('chapters')}>章節管理</div>
                <div className={`w-tab ${dashboardTab === 'reviews' ? 'active' : ''}`} onClick={() => setDashboardTab('reviews')}>讀者書評 (預留)</div>
              </div>

              {dashboardTab === 'chapters' ? (
                <div className="w-tab-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>目錄結構</h3>
                    <button className="hero-btn" style={{ padding: '8px 16px', borderRadius: '8px' }} onClick={handleWriteNewChapter}>
                      <Edit3 size={16} /> 寫新章節
                    </button>
                  </div>
                  
                  <div className="volume-container">
                    <div className="volume-header-dash">作品全卷</div>
                    <div className="chapter-list">
                      {/* 渲染所有章節 */}
                      {(selectedNovel.chapters || []).map((ch, index) => (
                        <div key={ch.id} className="chapter-row" onClick={() => handleEditChapter(ch)}>
                          <div className="chapter-row-title">
                            <span className={`chapter-status ${ch.status === 'published' ? 'dot-published' : 'dot-draft'}`}></span> 
                            第 {index + 1} 章：{ch.title}
                          </div>
                          <div className="chapter-row-actions">
                            <span className="chapter-word-count">{ch.wordCount || 0} 字</span>
                            <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); showToast('更多操作') }}><MoreVertical size={16}/></button>
                          </div>
                        </div>
                      ))}
                      
                      {(!selectedNovel.chapters || selectedNovel.chapters.length === 0) && (
                        <div style={{ padding: '40px 12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          <Book size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                          <div>這本書還沒有任何章節，點擊右上方按鈕開始創作吧！</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-tab-content" style={{ alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                  <MessageSquare size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                  <div style={{ color: 'var(--text-secondary)' }}>尚無讀者留下書評</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.5 }}>未來將於此處展示所有讀者的反饋</div>
                </div>
              )}
            </div>
          ) : (
            <div className="workspace-col" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <Book size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <div>請先在左側填寫書名並儲存，建立完畢後將解鎖章節寫作功能。</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============== 第三層：寫作編輯區 (EDITOR) ==============
  if (layer === 'EDITOR') {
    return (
      <div className="author-workspace">
        {/* Editor Main */}
        <div className="workspace-col writing-area-col" style={{ flex: 1 }}>
          <div className="writing-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <button className="icon-btn-circle" onClick={() => setLayer('DASHBOARD')} title="返回章節列表">
                <ArrowLeft size={20} />
              </button>
              <input 
                type="text" 
                className="chapter-title-input" 
                placeholder="輸入章節標題..." 
                value={chapterTitle}
                onChange={e => setChapterTitle(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="pick-btn" style={{ padding: '8px 16px' }} onClick={() => handleSaveEditor(false)}>
                <Save size={16} /> 儲存草稿
              </button>
              <button className="hero-btn" style={{ padding: '8px 16px' }} onClick={() => handleSaveEditor(true)}>
                <Send size={16} /> 發布章節
              </button>
            </div>
          </div>
          
          <textarea 
            className="story-textarea" 
            placeholder="從這裡開始撰寫..."
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ fontSize: '18px', padding: '0 20px', height: '100%' }}
          ></textarea>
        </div>

        {/* 右側輔助 */}
        <div className="workspace-col right-tools-col">
          <div className="workspace-tabs">
            <div className="w-tab active">寫作輔助</div>
          </div>
          <div className="w-tab-content">
            <div className="info-box">
              <div className="info-title">章節快速切換</div>
              {/* 渲染同本書的其他章節，方便作者參閱 */}
              {(selectedNovel.chapters || []).map((ch, idx) => (
                <div 
                  key={ch.id} 
                  className={`chapter-item ${editingChapterId === ch.id ? 'active' : ''}`}
                  onClick={() => handleEditChapter(ch)}
                >
                  第 {idx + 1} 章：{ch.title || '未命名'}
                </div>
              ))}
              
              {/* 如果是正在新增的全新章節，也會顯示在清單最下方 */}
              {!editingChapterId && (
                <div className="chapter-item active">
                  新增章節：{chapterTitle || '未命名'}
                </div>
              )}
            </div>
            <div className="info-box">
              <div className="info-title">寫作統計</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span>本章字數</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{content.length} 字</span>
              </div>
            </div>
            <div className="info-box">
              <div className="info-title">靈感與設定</div>
              <textarea className="info-textarea" placeholder="在這裡記錄世界觀與靈感大綱..."></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
