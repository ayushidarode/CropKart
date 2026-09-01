import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../api';
import { useAuth } from '../AuthContext';

function NegotiationChat({ crop, compact = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const canChat = user && (user.role === 'buyer' || (user.role === 'farmer' && user.id === crop.farmerId));

  const loadMessages = async () => {
    if (!canChat) return;
    try {
      setError('');
      const response = await messagesAPI.getThread(crop.id);
      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load messages');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMessages().finally(() => setLoading(false));
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [crop.id, user?.id]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!canChat || !text.trim()) return;

    setSending(true);
    try {
      const response = await messagesAPI.send({ cropId: crop.id, text });
      setMessages((current) => [...current, response.data]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`chat-panel ${compact ? 'compact' : ''}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Negotiation</p>
          <h3>Message {crop.farmerName}</h3>
        </div>
        <span className="badge badge-success">Live thread</span>
      </div>

      {!user && (
        <div className="empty-state compact">
          <p>Login as a buyer to negotiate price, quantity, and delivery terms.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Chat</button>
        </div>
      )}

      {user && !canChat && (
        <div className="alert alert-warning">This thread is available to buyers and the listing farmer.</div>
      )}

      {canChat && (
        <>
          <div className="chat-messages">
            {loading && messages.length === 0 ? (
              <div className="skeleton-line"></div>
            ) : messages.length === 0 ? (
              <p className="text-muted">Start the conversation before placing an order.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-bubble ${message.senderId === user.id ? 'mine' : 'theirs'}`}
                >
                  <div className="message-meta">
                    <strong>{message.senderName}</strong>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p>{message.text}</p>
                </div>
              ))
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="chat-form" onSubmit={handleSend}>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ask about rate, sample, delivery, or packing..."
            />
            <button className="btn btn-primary" disabled={sending || !text.trim()}>
              {sending ? 'Sending' : 'Send'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export default NegotiationChat;
