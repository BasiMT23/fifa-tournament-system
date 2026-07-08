import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.username}!</p>
      <p>Your role: {user?.role}</p>
      {/* Add quick links to active tournaments, fantasy team, etc. */}
    </div>
  );
}