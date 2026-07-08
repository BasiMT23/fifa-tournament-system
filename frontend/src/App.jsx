import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { connectSocket } from './services/socket';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Fantasy from './pages/Fantasy';

function Private({ children }) {
  const user = useAuth(s => s.user);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const fetchMe = useAuth(s => s.fetchMe);
  useEffect(() => { fetchMe().then(connectSocket); }, []);
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/tournaments" element={<Private><Tournaments /></Private>} />
      <Route path="/tournaments/:id" element={<Private><TournamentDetail /></Private>} />
      <Route path="/fantasy/:id" element={<Private><Fantasy /></Private>} />
    </Routes>
  );
}