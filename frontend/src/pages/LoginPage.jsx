import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authAPI } from '../api';

function LoginPage() {
  const [email, setEmail] = useState('ramesh@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      login(response.data.token, response.data.user);
      
      if (response.data.user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (response.data.user.role === 'buyer') {
        navigate('/buyer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <div className="card-body">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login to CropKart</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            Don't have an account? <Link to="/register" style={{ color: '#10b981', fontWeight: 'bold' }}>Sign up here</Link>
          </p>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Demo Credentials:</p>
            <p><strong>Farmer:</strong> ramesh@example.com / password123</p>
            <p><strong>Buyer:</strong> buyer@example.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
