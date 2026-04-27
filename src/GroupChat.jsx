import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Users, Info } from 'lucide-react';

export default function GroupChat({ novel, currentUser, showToast, onBack }) {
  const [messages, setMessages] = useState(novel.groupChat || []);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 每次訊息更新時，自動滾動到最底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!currentUser) {
      showToast('⚠️ 請先登入才能參與討論');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      text: inputText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');

    try {
      await fetch(`http://localhost:3001/novels/${novel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupChat: updatedMessages })
      });
    } catch(err) {
      showToast('❌ 訊息發送失敗');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', maxWidth: '900px', margin: '0 auto', backgroundColor: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
      {/* 聊天室標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="icon-btn-circle" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
          {novel.coverImage ? <img src={novel.coverImage} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="cover"/> : novel.title.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-primary)' }}>《{novel.title}》專屬討論群</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> 保持友善交流，共同維護閱讀環境
          </div>
        </div>
        <button className="icon-btn-circle" onClick={() => showToast(`原著作者：${novel.authorName}`)}>
          <Info size={20} />
        </button>
      </div>

      {/* 聊天訊息區塊 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <span style={{ backgroundColor: 'var(--card-bg)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            歡迎來到《{novel.title}》群組，這是一切討論的開端！
          </span>
        </div>
        
        {messages.map(msg => {
          const isMe = currentUser && msg.userId === currentUser.id;
          return (
            <div key={msg.id} style={{ display: 'flex', gap: '12px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isMe ? 'var(--primary-color)' : 'var(--card-bg)', color: isMe ? 'white' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, border: isMe ? 'none' : '1px solid var(--border-color)' }}>
                {msg.username.charAt(0)}
              </div>
              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', padding: '0 4px' }}>
                  {msg.username} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ 
                  backgroundColor: isMe ? 'var(--primary-color)' : 'var(--card-bg)', 
                  color: isMe ? 'white' : 'var(--text-primary)', 
                  padding: '12px 16px', borderRadius: '16px', 
                  borderTopLeftRadius: isMe ? '16px' : '4px',
                  borderTopRightRadius: isMe ? '4px' : '16px',
                  boxShadow: 'var(--shadow-sm)',
                  lineHeight: '1.5', wordBreak: 'break-word', fontSize: '15px'
                }}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 訊息輸入列 */}
      <div style={{ padding: '20px', backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder={currentUser ? "輸入訊息參與討論..." : "請先登入才能傳送訊息"}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={!currentUser}
            style={{ flex: 1, padding: '14px 20px', borderRadius: '24px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '15px' }}
          />
          <button 
            className="hero-btn" 
            onClick={handleSend}
            disabled={!currentUser || !inputText.trim()}
            style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (!currentUser || !inputText.trim()) ? 0.5 : 1 }}
          >
            <Send size={20} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
