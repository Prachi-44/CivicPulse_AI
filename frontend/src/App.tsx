import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CommandCenter } from './pages/CommandCenter';
import { LiveMapPage } from './pages/LiveMapPage';
import { CitizenPortal } from './pages/CitizenPortal';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0d1322] text-slate-800 dark:text-[#dde2f8] selection:bg-[#06b6d4] selection:text-[#003640] transition-colors duration-200">
            <Navbar />
            <main className="flex-1 pt-20">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/command-center" element={<CommandCenter />} />
                <Route path="/map" element={<LiveMapPage />} />
                <Route path="/citizen" element={<CitizenPortal />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
