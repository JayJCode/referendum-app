import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Referendums from './pages/Referendum';
import CreateReferendum from './pages/CreateReferendum';
import Register from './pages/Register';
import Moderate from './pages/Moderate';
import EditReferendum from './pages/EditReferendum';
import Users from './pages/Users';
import EditUser from './pages/EditUser';
import Tags from './pages/Tags';

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
              <Route path="/moderate" element={<Moderate />} />
              <Route path="/referendums/edit/:id" element={<EditReferendum />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/edit/:id" element={<EditUser />} />
              <Route path="/tags" element={<Tags />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}