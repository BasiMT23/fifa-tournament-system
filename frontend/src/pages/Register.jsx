import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      alert('Registration failed.');
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <button type="submit" style={{ width: '100%' }}>Register</button>
      </form>
    </div>
  );
}