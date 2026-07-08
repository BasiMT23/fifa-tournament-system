import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Profile</h1>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
      {/* Add avatar upload and user rating display here */}
    </div>
  );
}