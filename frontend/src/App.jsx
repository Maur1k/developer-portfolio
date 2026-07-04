import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const AdminLayout = React.lazy(() => import('./admin/AdminApp'));
const Login = React.lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.Login })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-gray-300">
      Loading dashboard...
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#09090b] via-[#111217] to-[#09090b] flex flex-col">
      {!isAdminRoute && <Navigation />}
      <main className="flex-grow">
        <Suspense fallback={<AdminFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route path="*" element={<AdminLayout />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && location.pathname !== '/' && <Footer />}
    </div>
  );
}

export default function AppShell() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
