import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, LayoutGrid, Trophy, Bookmark, 
  Star, MessageCircle, Search, Bell, MessageSquare, 
  ChevronRight, Play, PawPrint, Heart, Feather, BookOpen, User, LogIn, PenTool, Sparkles
} from 'lucide-react';
import Profile from './Profile';
import AuthModal from './AuthModal';
import AuthorAssistant from './AuthorAssistant';
import CategoryBrowser from './CategoryBrowser';
import NovelReader from './NovelReader';
import BookmarkList from './BookmarkList';
import RankingList from './RankingList';
import NewBooks from './NewBooks';
import HomeView from './HomeView';
import CommunityBrowser from './CommunityBrowser';
import GroupChat from './GroupChat';
import SearchResults from './SearchResults';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeMenu, setActiveMenu] = useState('首頁');
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedReadingNovel, setSelectedReadingNovel] = useState(null);
  const [activeChatNovel, setActiveChatNovel] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 支援 Ctrl+K 或 Cmd+K 快捷鍵聚焦搜尋框
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('home');
    setActiveMenu('首頁');
    showToast('👋 您已成功登出');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('search');
      setActiveMenu('');
    }
  };

  const handleNovelClick = (novel) => {
    setSelectedReadingNovel(novel);
    setCurrentPage('reader');
    setActiveMenu('');
  };

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    if (menuName === '首頁') {
      setCurrentPage('home');
    } else if (menuName === '作家助手') {
      setCurrentPage('author');
    } else if (menuName === '新書推薦') {
      setCurrentPage('newBooks');
    } else if (menuName === '分類瀏覽') {
      setCurrentPage('categoryBrowse');
    } else if (menuName === '排行榜') {
      setCurrentPage('ranking');
    } else if (menuName === '收藏清單') {
      setCurrentPage('bookmarks');
    } else if (menuName === '社群交流') {
      setCurrentPage('community');
    } else {
      showToast(`正在前往 ${menuName}...`);
    }
  };

  const navItems = [
    { name: '首頁', icon: Home },
    { name: '作家助手', icon: PenTool },
    { name: '新書推薦', icon: Sparkles },
    { name: '分類瀏覽', icon: LayoutGrid },
    { name: '排行榜', icon: Trophy },
    { name: '收藏清單', icon: Bookmark },
    { name: '社群交流', icon: MessageCircle },
  ];

  const quickTags = ['奇幻', '戀愛', '校園', '戰鬥', '日常', '科幻', '懸疑', '治癒'];

  return (
    <>
      <aside className="sidebar">
        <div 
          className="logo-container" 
          style={{ cursor: 'pointer' }}
          onClick={() => { setCurrentPage('home'); setActiveMenu('首頁'); }}
        >
          <div className="logo-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
            <Feather size={20} color="white" />
          </div>
          <div className="logo-text" style={{ fontSize: '22px' }}>墨羽文庫</div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <div 
              key={item.name}
              className={`nav-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.name)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        {currentPage === 'home' && (
          <>
            <div className="nav-divider"></div>

            <div className="nav-group-title">快速分類</div>
            <div className="tags-grid">
              {quickTags.map(tag => (
                <button 
                  key={tag} 
                  className="tag-btn"
                  style={{
                    backgroundColor: activeTag === tag ? 'var(--primary-color)' : '',
                    color: activeTag === tag ? 'white' : ''
                  }}
                  onClick={() => {
                    setActiveTag(tag === activeTag ? null : tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      <div className="main-wrapper">
        <header className="header">
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="搜尋小說名稱、作者、分類..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-shortcut">Ctrl K</span>
            <button type="submit" className="search-btn" onClick={handleSearch}>
              <Search size={16} />
            </button>
          </form>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => showToast('目前沒有新通知')}>
              <Bell size={20} />
            </button>
            <button className="icon-btn" onClick={() => showToast('開啟訊息中心')}>
              <MessageSquare size={20} />
            </button>
            
            {currentUser ? (
              <div 
                className="user-profile" 
                onClick={() => { 
                  setCurrentPage('profile'); 
                  setActiveMenu(''); 
                }}
                style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: currentPage === 'profile' ? 'var(--primary-light)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                <div className="avatar">
                  <User size={20} />
                </div>
                <div className="username" style={{ color: currentPage === 'profile' ? 'var(--primary-color)' : 'inherit' }}>
                  {currentUser.username} <ChevronRight size={16} />
                </div>
              </div>
            ) : (
              <button 
                className="pick-btn" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn size={16} /> 登入 / 註冊
              </button>
            )}
          </div>
        </header>

        <main className="content-area">
          {currentPage === 'home' ? (
            <HomeView 
              activeTag={activeTag} 
              showToast={showToast} 
              onNovelClick={handleNovelClick} 
            />
          ) : currentPage === 'profile' ? (
            <Profile 
              showToast={showToast} 
              profile={currentUser} 
              setProfile={(updatedUser) => {
                setCurrentUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              }}
              onLogout={handleLogout}
            />
          ) : currentPage === 'author' ? (
            <AuthorAssistant showToast={showToast} currentUser={currentUser} />
          ) : currentPage === 'categoryBrowse' ? (
            <CategoryBrowser showToast={showToast} onNovelClick={handleNovelClick} />
          ) : currentPage === 'ranking' ? (
            <RankingList showToast={showToast} onNovelClick={handleNovelClick} />
          ) : currentPage === 'newBooks' ? (
            <NewBooks showToast={showToast} onNovelClick={handleNovelClick} />
          ) : currentPage === 'bookmarks' ? (
            <BookmarkList currentUser={currentUser} onNovelClick={handleNovelClick} showToast={showToast} />
          ) : currentPage === 'community' ? (
            <CommunityBrowser 
              onChatClick={(novel) => {
                setActiveChatNovel(novel);
                setCurrentPage('groupChat');
                setActiveMenu('社群交流');
              }} 
              showToast={showToast} 
            />
          ) : currentPage === 'groupChat' && activeChatNovel ? (
            <GroupChat 
              novel={activeChatNovel}
              currentUser={currentUser}
              showToast={showToast}
              onBack={() => {
                setCurrentPage('community');
                setActiveMenu('社群交流');
              }}
            />
          ) : currentPage === 'search' ? (
            <SearchResults query={searchQuery} onNovelClick={handleNovelClick} showToast={showToast} />
          ) : currentPage === 'reader' && selectedReadingNovel ? (
            <NovelReader 
              novel={selectedReadingNovel} 
              onBack={() => {
                setCurrentPage('home');
                setActiveMenu('首頁');
              }} 
              showToast={showToast} 
              currentUser={currentUser}
              onUpdateUser={(updatedUser) => {
                setCurrentUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              }}
            />
          ) : null}
        </main>
      </div>

      {toast && (
        <div className="toast-container">
          <BookOpen size={18} />
          {toast}
        </div>
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
      )}
    </>
  );
}

export default App;
