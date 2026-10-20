/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  LogOut,
  Mail,
  Lock,
  UserCheck,
  AlertCircle,
  Sparkles,
  User,
  ArrowRight,
  Shield,
  CheckCircle2,
  RefreshCw,
  Key,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onGoogleSignIn: () => Promise<void>;
  onGuestSignIn: () => Promise<void>;
  onEmailAuth: (e: React.FormEvent) => Promise<void>;
  onSignOut: () => Promise<void>;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (pass: string) => void;
  isAuthSignUp: boolean;
  setIsAuthSignUp: (isSignUp: boolean) => void;
  authLoading: boolean;
  authError: string | null;
  authSuccessMsg: string | null;
  unauthorizedDomain: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGoogleSignIn,
  onGuestSignIn,
  onEmailAuth,
  onSignOut,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  isAuthSignUp,
  setIsAuthSignUp,
  authLoading,
  authError,
  authSuccessMsg,
  unauthorizedDomain,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#090d16] border border-cyan-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-white flex flex-col space-y-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              🔐
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Account Sign In & Cloud Sync
              </h2>
              <p className="text-[11px] text-white/50">
                Secure Firebase authentication & user profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition cursor-pointer"
            title="Close Auth Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Current Signed In Account Card */}
          {currentUser ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-black/60 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">Signed In Active User</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUser.isAnonymous ? 'Guest Account' : 'Authenticated'}
                </span>
              </div>

              <div className="text-xs space-y-1 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="font-semibold text-white truncate">
                  {currentUser.email || (currentUser.isAnonymous ? 'Guest Student Account' : 'User Identity')}
                </div>
                <div className="text-[10px] text-white/50 font-mono truncate">
                  UID: {currentUser.uid}
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await onSignOut();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Current Account</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Not signed in. Sign in below to enable personal Firebase cloud sync.</span>
            </div>
          )}

          {/* Feedback Messages */}
          {authSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* 1. Google Sign In Button */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">
              Option 1: Quick Google Authentication
            </span>
            <button
              type="button"
              disabled={authLoading}
              onClick={onGoogleSignIn}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[10px] text-white/40 uppercase tracking-widest font-mono">OR</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* 2. Email & Password Form */}
          <form onSubmit={onEmailAuth} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                Option 2: Email & Password
              </span>
              <button
                type="button"
                onClick={() => setIsAuthSignUp(!isAuthSignUp)}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
              >
                {isAuthSignUp ? 'Switch to Sign In' : 'Create New Account'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter password (min 6 characters)"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading || !authEmail.trim() || !authPassword}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              <span>{isAuthSignUp ? 'Create Account & Sign In' : 'Sign In with Email'}</span>
            </button>
          </form>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[10px] text-white/40 uppercase tracking-widest font-mono">OR</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* 3. Guest Sign In Button */}
          <div className="space-y-1">
            <button
              type="button"
              disabled={authLoading}
              onClick={onGuestSignIn}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Continue as Guest Student (Instant Access)</span>
            </button>
            <p className="text-[10px] text-white/40 text-center">
              No registration needed. Cloud saving works automatically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60 bg-white/[0.01]">
          <span className="text-[11px] text-white/40 font-mono">Firebase Protected Auth</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
