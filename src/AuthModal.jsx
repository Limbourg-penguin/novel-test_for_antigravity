import React, { useState } from 'react';
import { X, User, Lock } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('⚠️ 請填寫完整帳號與密碼');
      return;
    }

    if (isLogin) {
      // 登入邏輯
      try {
        const res = await fetch(`http://localhost:3001/users?username=${username}&password=${password}`);
        const users = await res.json();
        if (users.length > 0) {
          showToast('✅ 登入成功！歡迎回來，' + users[0].username);
          onLoginSuccess(users[0]);
        } else {
          showToast('❌ 帳號或密碼錯誤，請再試一次');
        }
      } catch (err) {
        showToast('❌ 伺服器連線錯誤，請確認資料庫是否啟動');
      }
    } else {
      // 註冊邏輯
      try {
        // 先檢查帳號是否已存在
        const checkRes = await fetch(`http://localhost:3001/users?username=${username}`);
        const exists = await checkRes.json();
        if (exists.length > 0) {
          showToast('⚠️ 此名稱已被使用，請換一個名字');
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          username: username.trim(),
          password,
          vipStatus: "一般會員",
          joinDate: new Date().toISOString().split('T')[0],
          stats: {
            readingTime: "0 小時",
            booksRead: "0 本",
            bookmarks: "0 本",
            coins: "100" // 註冊送 100 墨幣
          }
        };

        const res = await fetch('http://localhost:3001/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        
        if (res.ok) {
          const createdUser = await res.json();
          showToast('✅ 註冊成功！已贈送 100 墨幣，為您自動登入');
          onLoginSuccess(createdUser);
        }
      } catch (err) {
        showToast('❌ 伺服器連線錯誤，請稍後再試');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="modal-title">{isLogin ? '歡迎回到墨羽文庫' : '加入墨羽文庫'}</h2>
        
        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
            登入
          </button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
            註冊新帳號
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="使用者名稱" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="密碼" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="hero-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {isLogin ? '立即登入' : '註冊並開始閱讀'}
          </button>
        </form>
      </div>
    </div>
  );
}
