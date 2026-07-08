import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
});

export const connectSocket = () => {
  if (localStorage.getItem('accessToken')) socket.connect();
};

export default socket;