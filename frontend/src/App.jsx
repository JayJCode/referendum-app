import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Referendums from './pages/Referendum';
import CreateReferendum from './pages/CreateReferendum';
import Register from './pages/Register';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/referendums" element={<Referendums />} />
              <Route path="/referendums/create" element={<CreateReferendum />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}