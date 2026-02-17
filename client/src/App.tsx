import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import Router from './Router';

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </SocketProvider>
  );
}

export default App;
