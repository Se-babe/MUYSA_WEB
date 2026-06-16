import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import {
  getConversations, subscribeToMessages, sendMessage, markMessagesRead,
} from '../services/firestore';
import { FiSend, FiArrowLeft } from 'react-icons/fi';

export default function Messages() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchConversations = () => {
    getConversations(user.id)
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (convId) setActiveConv(convId);
  }, [searchParams]);

  useEffect(() => {
    if (!activeConv) return;
    const unsubscribe = subscribeToMessages(activeConv, (msgs) => {
      setMessages(msgs);
      markMessagesRead(activeConv, user.id);
    });
    return unsubscribe;
  }, [activeConv, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (convId) => {
    setActiveConv(convId);
    setSearchParams({ conversation: convId });
  };

  const backToList = () => {
    setActiveConv(null);
    setSearchParams({});
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    try {
      await sendMessage(activeConv, user.id, newMessage);
      setNewMessage('');
      fetchConversations();
    } catch {
      alert('Failed to send message');
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConv);
  const otherParticipant = activeConversation?.participants?.[0];
  const showList = !isMobile || !activeConv;
  const showChat = !isMobile || activeConv;

  return (
    <Layout>
      <div className="page-header page-header-compact">
        <h1>Messages</h1>
      </div>

      <div className={`messages-layout${isMobile ? ' messages-layout-mobile' : ''}`}>
        {showList && (
          <aside className="conversations-list">
            {loading ? (
              <div className="loading-inline"><div className="spinner" /></div>
            ) : conversations.length ? (
              conversations.map((conv) => {
                const other = conv.participants?.[0];
                return (
                  <button
                    key={conv.id}
                    type="button"
                    className={`conv-item ${activeConv === conv.id ? 'active' : ''}`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <div className="conv-avatar">{other?.full_name?.charAt(0) || '?'}</div>
                    <div className="conv-info">
                      <strong>{other?.full_name || 'Unknown'}</strong>
                      <span className="conv-preview">{conv.last_message?.slice(0, 40) || 'No messages'}</span>
                    </div>
                    {conv.unread_count > 0 && <span className="unread-badge">{conv.unread_count}</span>}
                  </button>
                );
              })
            ) : (
              <p className="empty-text">No conversations yet. Message someone from the directory.</p>
            )}
          </aside>
        )}

        {showChat && (
          <section className="chat-panel">
            {activeConv ? (
              <>
                <div className="chat-header">
                  {isMobile && (
                    <button type="button" className="btn-icon chat-back-btn" onClick={backToList} aria-label="Back">
                      <FiArrowLeft />
                    </button>
                  )}
                  <h3>{otherParticipant?.full_name || 'Conversation'}</h3>
                </div>
                <div className="chat-messages">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                    >
                      <p>{msg.content}</p>
                      <span className="msg-time">{msg.created_at?.toLocaleTimeString?.() || ''}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form className="chat-input" onSubmit={handleSend}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="btn btn-primary btn-icon" aria-label="Send">
                    <FiSend />
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}
