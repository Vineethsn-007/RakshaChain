import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Send, Search, Flag, LogOut, Activity } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('mock_token') || '');

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('mock_token', newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('mock_token');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <Shield className="text-primary" size={32} color="#8b5cf6" />
          <span className="gradient-text">Nexus Ledger</span>
        </div>
        {token && (
          <button className="btn" onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
            <LogOut size={18} /> Logout
          </button>
        )}
      </nav>

      {!token ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      if (res.data.token) {
        onLogin(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', width: '100%' }}>
      <div className="glass-card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Access Ledger</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Node Operator ID</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="operator_1"
              required 
            />
          </div>
          <div className="input-group">
            <label>Decryption Key</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Initialize Session'}
          </button>
          {error && <div className="message error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text">Operator Console</h2>
        <p style={{ color: 'var(--text-muted)' }}>Secure blockchain fund management interface.</p>
      </div>
      
      <div className="dashboard-grid">
        <AddTransactionCard />
        <CheckFundsCard />
        <FlagTransactionCard />
      </div>
    </div>
  );
}

function AddTransactionCard() {
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/add-transaction`, { 
        amount: parseFloat(amount), 
        to,
        purpose: "Transfer" 
      });
      setMsg({ type: 'success', text: `Success! TX_ID: ${res.data.tx_id || 'N/A'}` });
      setAmount('');
      setTo('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Send color="#8b5cf6" />
        <h3>Execute Transfer</h3>
      </div>
      <form onSubmit={handleTransfer}>
        <div className="input-group">
          <label>Recipient Address</label>
          <input 
            type="text" 
            className="input-field" 
            value={to} 
            onChange={e => setTo(e.target.value)} 
            placeholder="0x..."
            required 
          />
        </div>
        <div className="input-group">
          <label>Amount</label>
          <input 
            type="number" 
            className="input-field" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00"
            required 
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
          Confirm Transfer
        </button>
      </form>
      {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
    </div>
  );
}

function CheckFundsCard() {
  const [walletId, setWalletId] = useState('');
  const [balance, setBalance] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBalance(null);
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/funds/${walletId}`);
      if (res.data.error) {
        setMsg({ type: 'error', text: res.data.error });
      } else if (res.data.balance !== undefined) {
        setBalance(res.data.balance);
      } else {
        setMsg({ type: 'error', text: 'Empty response or invalid data' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Search color="#ec4899" />
        <h3>Check Wallet Balance</h3>
      </div>
      <form onSubmit={handleCheck}>
        <div className="input-group">
          <label>Wallet ID</label>
          <input 
            type="text" 
            className="input-field" 
            value={walletId} 
            onChange={e => setWalletId(e.target.value)} 
            placeholder="Enter ID to lookup..."
            required 
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%', background: 'linear-gradient(135deg, #ec4899, #be185d)' }} disabled={loading}>
          Query Ledger
        </button>
      </form>
      
      {balance !== null && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Balance</div>
          <div className="stat-value" style={{ color: '#ec4899' }}>{balance}</div>
        </div>
      )}
      {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
    </div>
  );
}

function FlagTransactionCard() {
  const [txId, setTxId] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFlag = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      // The mock backend sleeps for 5s if txId > 50 chars, simulating a timeout
      const res = await axios.post(`${API_BASE}/flag-transaction`, { 
        transaction_id: txId, 
        reason 
      });
      setMsg({ type: 'success', text: 'Transaction flagged for review.' });
      setTxId('');
      setReason('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Flag color="#ef4444" />
        <h3>Flag Suspicious TX</h3>
      </div>
      <form onSubmit={handleFlag}>
        <div className="input-group">
          <label>Transaction ID</label>
          <input 
            type="text" 
            className="input-field" 
            value={txId} 
            onChange={e => setTxId(e.target.value)} 
            placeholder="TX..."
            required 
          />
        </div>
        <div className="input-group">
          <label>Reason for Flag</label>
          <input 
            type="text" 
            className="input-field" 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="Fraud, Error, etc."
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }} disabled={loading}>
          Submit Report
        </button>
      </form>
      {msg && <div className={`message ${msg.type}`}>{msg.text}</div>}
    </div>
  );
}

export default App;
