import React, { useState, useEffect } from 'react';
import { X, Lock, Phone, KeyRound, UserPlus, LogIn, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api, setToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    refreshUser,
    showToast,
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devMockOtp, setDevMockOtp] = useState<string | null>(null);

  // Check URL params for referral code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || window.location.hash.split('ref=')[1];
    if (ref) {
      setReferralCode(ref.split('&')[0]);
      setAuthMode('register');
    }
  }, [setAuthMode]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!showAuthModal) return null;

  const handleSendOtp = async (purpose: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await api.sendOtp(cleanPhone, purpose);
      showToast(res.message, 'success');
      if (res.mockOtp) {
        setDevMockOtp(res.mockOtp);
        setOtpCode(res.mockOtp); // Auto-fill in dev mode for maximum convenience
      }
      setCountdown(60);
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        if (!password || password.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          showToast('Passwords do not match', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!otpCode) {
          showToast('Please enter the OTP verification code', 'error');
          setIsSubmitting(false);
          return;
        }

        const res = await api.register({
          phone: cleanPhone,
          password,
          otpCode,
          referralCode: referralCode.trim() || undefined,
        });

        setToken(res.token);
        await refreshUser();
        showToast('Account created successfully! Welcome Bonus credited.', 'success');
        setShowAuthModal(false);
      } else if (authMode === 'login') {
        const res = await api.login({
          phone: cleanPhone,
          password: isOtpLogin ? undefined : password,
          otpLogin: isOtpLogin,
          otpCode: isOtpLogin ? otpCode : undefined,
        });

        setToken(res.token);
        await refreshUser();
        showToast('Logged in successfully!', 'success');
        setShowAuthModal(false);
      } else if (authMode === 'forgot') {
        if (!otpCode || !password) {
          showToast('Please enter OTP and new password', 'error');
          setIsSubmitting(false);
          return;
        }
        await api.forgotPassword({
          phone: cleanPhone,
          otpCode,
          newPassword: password,
        });
        showToast('Password reset successfully! Please login.', 'success');
        setAuthMode('login');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/logo.svg" alt="EarnLoop" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              {authMode === 'register' ? 'Register Account' : authMode === 'forgot' ? 'Reset Password' : 'Sign In'}
            </span>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher (Login / Register) */}
        {authMode !== 'forgot' && (
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${
                authMode === 'login'
                  ? 'border-[#0088FF] text-[#0088FF] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${
                authMode === 'register'
                  ? 'border-[#0088FF] text-[#0088FF] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Register (Earn 20 Mcoin)
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-sm">
          {/* Dev Mock Banner if available */}
          {devMockOtp && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              <span>Dev Mock OTP Code: <strong>{devMockOtp}</strong> (Auto-filled)</span>
            </div>
          )}

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <span className="text-xs font-bold text-gray-500 mr-1.5">+91</span>
                <Phone size={15} />
              </div>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={10}
                className="w-full pl-16 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0088FF] font-medium"
                required
              />
            </div>
          </div>

          {/* OTP Section (for Register, Forgot, or OTP Login) */}
          {(authMode === 'register' || authMode === 'forgot' || (authMode === 'login' && isOtpLogin)) && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">SMS Verification Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={15} />
                  </div>
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSendOtp(authMode === 'register' ? 'REGISTRATION' : authMode === 'forgot' ? 'PASSWORD_RESET' : 'LOGIN')}
                  disabled={isSendingOtp || countdown > 0}
                  className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#0088FF] font-bold text-xs rounded-xl transition border border-gray-200 disabled:opacity-50 shrink-0"
                >
                  {countdown > 0 ? `${countdown}s` : isSendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Password Input (if not OTP login) */}
          {(!isOtpLogin || authMode === 'register' || authMode === 'forgot') && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-700">
                  {authMode === 'forgot' ? 'New Password' : 'Password'}
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsOtpLogin(!isOtpLogin)}
                    className="text-[11px] text-[#0088FF] hover:underline font-semibold"
                  >
                    Use SMS OTP Login
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                  required
                />
              </div>
            </div>
          )}

          {/* Confirm Password for Register */}
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                  required
                />
              </div>
            </div>
          )}

          {/* Referral Code (for Register) */}
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Invitation Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. sx5PB08U7T"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl uppercase font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
              />
            </div>
          )}

          {/* Links for Login */}
          {authMode === 'login' && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => setIsOtpLogin(!isOtpLogin)}
                className="text-[#0088FF] hover:underline"
              >
                {isOtpLogin ? 'Switch to Password Login' : 'Login via SMS OTP'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="hover:underline text-gray-600"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0088FF] hover:bg-[#0077E6] text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : authMode === 'register' ? (
                <>
                  <UserPlus size={18} />
                  <span>Register & Claim 20 Mcoin</span>
                </>
              ) : authMode === 'forgot' ? (
                <span>Reset Password</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Log In to EarnLoop</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom helper */}
          {authMode === 'forgot' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-[#0088FF] font-semibold hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
