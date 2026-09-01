import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assistantAPI } from '../api';

function CropSathiAssistant() {
  const [query, setQuery] = useState('compare my price to market');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const askAssistant = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await assistantAPI.query({ query });
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'CropSathi could not answer right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-panel assistant-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CropSathi</p>
          <h3>AI Assistant</h3>
        </div>
      </div>
      <form className="chat-form" onSubmit={askAssistant}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about buyers, price, or orders" />
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Thinking' : 'Ask'}</button>
      </form>
      {error && <div className="alert alert-error">{error}</div>}
      {response && (
        <div className="request-body">
          <p>{response.answer}</p>
          {response.actionUrl && <Link className="btn btn-secondary" to={response.actionUrl}>{response.actionLabel || 'Open'}</Link>}
        </div>
      )}
    </section>
  );
}

export default CropSathiAssistant;
