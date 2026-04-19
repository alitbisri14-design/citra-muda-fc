import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PlayerRoster from './components/PlayerRoster';
import MatchSchedule from './components/MatchSchedule';
import MatchScores from './components/MatchScores';
import FinancialModule from './components/FinancialModule';
import OrgStructure from './components/OrgStructure';
import AttendanceForm from './components/AttendanceForm';
import { Menu, X } from 'lucide-react';
import { Match, Transaction } from './types';
import { MOCK_MATCHES, MOCK_TRANSACTIONS } from './mockData';
import clubLogo from './assets/citra-muda-logo.png';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [loginError, setLoginError] = useState('');

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL ?? '';
  const authApiBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:4000';

  useEffect(() => {
    const savedAdmin = localStorage.getItem('citramudafc_admin_logged_in');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const resetFormState = () => {
    setLoginEmail('');
    setLoginOtp('');
    setIsOtpRequested(false);
    setLoginMessage('');
    setLoginError('');
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitLogin();
  };

  const submitLogin = async () => {
    setLoginError('');
    setLoginMessage('');

    if (!adminEmail) {
      setLoginError('Konfigurasi admin belum lengkap. Periksa VITE_ADMIN_EMAIL.');
      return;
    }

    if (loginEmail.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
      setLoginError('Email admin tidak sesuai.');
      return;
    }

    try {
      if (!isOtpRequested) {
        const response = await fetch(`${authApiBaseUrl}/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail.trim().toLowerCase() }),
        });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          setLoginError(data.message ?? 'Gagal mengirim OTP.');
          return;
        }

        setIsOtpRequested(true);
        setLoginMessage('OTP berhasil dikirim ke email admin. Cek inbox lalu masukkan kodenya.');
        return;
      }

      const verifyResponse = await fetch(`${authApiBaseUrl}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          otp: loginOtp.trim(),
        }),
      });
      const verifyData = (await verifyResponse.json()) as { message?: string };

      if (!verifyResponse.ok) {
        setLoginError(verifyData.message ?? 'OTP tidak valid.');
        return;
      }

      setIsAdmin(true);
      localStorage.setItem('citramudafc_admin_logged_in', 'true');
      setShowLoginModal(false);
      resetFormState();
    } catch (error) {
      console.error('Login request failed:', error);
      setLoginError('Tidak bisa terhubung ke server autentikasi.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('citramudafc_admin_logged_in');
  };

  const handleAuthButton = () => {
    if (isAdmin) {
      handleLogout();
    } else {
      setShowLoginModal(true);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'roster':
        return <PlayerRoster isAdmin={isAdmin} />;
      case 'matches':
        return <MatchSchedule isAdmin={isAdmin} />;
      case 'scores':
        return <MatchScores isAdmin={isAdmin} />;
      case 'finance':
        return <FinancialModule isAdmin={isAdmin} />;
      case 'org':
        return <OrgStructure isAdmin={isAdmin} />;
      case 'attendance':
        return <AttendanceForm isAdmin={isAdmin} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isAdmin={isAdmin} 
        onAuthButtonClick={handleAuthButton}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 lg:ml-64 min-h-screen p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.35)]">
                <img src={clubLogo} alt="Logo Citra Muda FC" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-glow">Citra Muda FC</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 glass rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>

          {showLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="glass rounded-3xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-glow">Login Admin</h2>
                    <p className="text-white/60 text-sm">Masuk dengan email admin dan verifikasi OTP.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setLoginError('');
                      resetFormState();
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-electric-green/50 transition-colors"
                      placeholder="Masukkan email admin"
                      required
                    />
                  </div>

                  {isOtpRequested && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Kode OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-electric-green/50 transition-colors"
                        placeholder="Masukkan 6 digit OTP"
                        required
                      />
                    </div>
                  )}

                  {loginMessage && <p className="text-sm text-electric-green">{loginMessage}</p>}
                  {loginError && <p className="text-sm text-red-400">{loginError}</p>}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        setLoginError('');
                        resetFormState();
                      }}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-electric-green text-black font-bold hover:scale-[1.01] transition-all"
                    >
                      {isOtpRequested ? 'Verifikasi OTP' : 'Kirim OTP'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {renderView()}
        </div>
      </main>
    </div>
  );
}
