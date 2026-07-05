import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, LogIn, UserPlus, Info, Check, User as UserIcon, Phone } from 'lucide-react';

interface MailAuthProps {
  onLogin: (user: User) => void;
}

export const MailAuth: React.FC<MailAuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Retrieve users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('restaurant_users') || '[]');

    if (isSignUp) {
      // Form Validation for Sign Up
      if (!fullName.trim()) {
        setError('Please enter your Full Name.');
        return;
      }

      if (!phoneNumber.trim()) {
        setError('Please enter your Phone Number.');
        return;
      }

      // Check for country-coded 10-12 digit phone number format
      const phoneRegex = /^\+?[0-9]{10,12}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        setError('Invalid Phone Number format. Must be 10-12 digits with an optional leading "+" country-code (e.g. +919876543210 or 9876543210).');
        return;
      }

      // Sign Up flow
      const userExists = storedUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists || email.toLowerCase() === 'admin@palaceinn.com') {
        setError('This email is already registered.');
        return;
      }

      // Determine role based on email - if email is admin@palaceinn.com, it is admin
      const role = 'guest';
      const newUser = { email, password, role, fullName: fullName.trim(), phoneNumber: phoneNumber.trim() };
      storedUsers.push(newUser);
      localStorage.setItem('restaurant_users', JSON.stringify(storedUsers));

      setSuccess('Account created successfully! You can now log in.');
      setIsSignUp(false);
      setPassword('');
      setFullName('');
      setPhoneNumber('');
    } else {
      // Login flow
      // 1. Check if Temp Admin
      if (email.toLowerCase() === 'admin@palaceinn.com' && password === 'admin123') {
        const adminUser: User = { email: 'admin@palaceinn.com', role: 'admin' };
        onLogin(adminUser);
        return;
      }

      // 2. Check local registered users
      const matchedUser = storedUsers.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matchedUser) {
        onLogin({ email: matchedUser.email, role: matchedUser.role });
      } else {
        setError('Invalid email or password. Use admin@palaceinn.com / admin123 to access the Owner Dashboard.');
      }
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@palaceinn.com');
    setPassword('admin123');
    setIsSignUp(false);
    setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          Security Access Control
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Restaurant Bridge Login
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Authenticate to place smart-menu orders, request service, or manage the kitchen analog bridge.
        </p>
      </div>

      {/* Temp Credentials Helper */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
          <Info className="w-4 h-4 shrink-0 text-slate-700" />
          <span>Admin Credentials (Owner Dashboard)</span>
        </div>
        <p className="text-slate-600 leading-normal">
          Log in with the temp admin credentials to access live KOT queues, stock levels, and revenue metrics.
        </p>
        <button
          type="button"
          onClick={autofillAdmin}
          className="mt-1.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-sm"
        >
          Autofill Temp Admin Credentials
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {isSignUp && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  required
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Phone Number (Country Code Coded, 10-12 Digits)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g., +919876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  required
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Include optional country code + and 10 to 12 digits (no spaces/dashes).</p>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g., guest@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              required
            />
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              required
            />
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-slate-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          {isSignUp ? (
            <>
              <UserPlus className="w-4 h-4" /> Sign Up & Register
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Log In securely
            </>
          )}
        </button>

        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100"></span>
          </div>
          <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400 font-mono">Or</span>
        </div>

        <button
          type="button"
          onClick={() => {
            let tNum = 1;
            try {
              if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const tableParam = params.get('table_id') || params.get('table') || params.get('table_number') || params.get('tableNum');
                if (tableParam) {
                  const parsed = parseInt(tableParam, 10);
                  if (!isNaN(parsed) && parsed > 0) tNum = parsed;
                }
              }
            } catch (e) {
              console.error(e);
            }
            onLogin({ email: `guest.table${tNum}@palaceinn.com`, role: 'guest' });
          }}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          🍛 Continue as Guest (Table {(() => {
            try {
              if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const tableParam = params.get('table_id') || params.get('table') || params.get('table_number') || params.get('tableNum');
                if (tableParam) {
                  const parsed = parseInt(tableParam, 10);
                  if (!isNaN(parsed) && parsed > 0) return parsed;
                }
              }
            } catch (e) {}
            return 1;
          })()})
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setSuccess('');
          }}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
        >
          {isSignUp
            ? 'Already have an account? Log In'
            : "Don't have an account? Sign Up as Guest"}
        </button>
      </div>
    </div>
  );
};
