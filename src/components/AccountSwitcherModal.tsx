import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Check,
  X,
  LogIn,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { UserAccount } from "../types";
import { REGISTERED_ACCOUNTS, authenticate } from "../data/authAccounts";

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  language: "id" | "en";
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  language,
}) => {
  const isId = language === "id";

  // Mode: "profile" (if logged in) or "login"
  const [viewMode, setViewMode] = useState<"profile" | "login">(
    currentUser ? "profile" : "login"
  );

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setViewMode(currentUser ? "profile" : "login");
      setErrorMessage(null);
      if (!currentUser) {
        setEmailInput("priscilla.andow@binus.ac.id");
        setPasswordInput("01234");
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleQuickFill = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!emailInput.trim()) {
      setErrorMessage(isId ? "Silakan masukkan email atau username" : "Please enter email or username");
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage(isId ? "Silakan masukkan kata sandi" : "Please enter password");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = authenticate(emailInput, passwordInput);
      setIsLoading(false);

      if (user) {
        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMessage(
          isId
            ? "Email atau kata sandi tidak valid. Pastikan kata sandi adalah 01234."
            : "Invalid email or password. Please verify password is 01234."
        );
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              {viewMode === "profile" ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {viewMode === "profile"
                  ? isId
                    ? "Profil Akun"
                    : "Account Profile"
                  : isId
                  ? "Masuk ke Claudit"
                  : "Sign In to Claudit"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {viewMode === "profile"
                  ? isId
                    ? "Kelola sesi dan peran auditor"
                    : "Manage active auditor session"
                  : isId
                  ? "Gunakan email dan kata sandi terdaftar"
                  : "Enter your registered credentials"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {viewMode === "profile" && currentUser ? (
            /* Current Profile View */
            <div className="space-y-5">
              {/* User Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-white shadow-sm ${
                      currentUser.role === "admin"
                        ? "bg-gradient-to-tr from-indigo-600 to-purple-600"
                        : "bg-gradient-to-tr from-emerald-600 to-teal-600"
                    }`}
                  >
                    {currentUser.initials || "AU"}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {currentUser.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          currentUser.role === "admin"
                            ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70"
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {currentUser.email}
                    </p>

                    <div className="flex items-center space-x-1 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>
                        {currentUser.role === "admin"
                          ? isId
                            ? "Hak Akses Penuh: Konfigurasi & Analitik"
                            : "Full Privileges: Config & Analytics"
                          : isId
                          ? "Hak Akses Auditor Standar: Investigasi & Laporan"
                          : "Standard Auditor: Investigation & Reports"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setViewMode("login");
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center space-x-2 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isId ? "Ganti Akun / Log In Akun Lain" : "Switch Account / Sign In Other"}</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setViewMode("login");
                    setEmailInput("");
                    setPasswordInput("");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 font-semibold text-xs text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center space-x-2 border border-rose-200/60 dark:border-rose-900/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isId ? "Keluar (Log Out)" : "Log Out"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form View */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{isId ? "Pilih Cepat Akun Demo:" : "Quick Demo Credentials:"}</span>
                  <span className="text-[10px] text-indigo-500 font-mono">pass: 01234</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("priscilla.andow@binus.ac.id", "01234")}
                    className={`p-2 rounded-xl text-left border text-xs transition-all ${
                      emailInput === "priscilla.andow@binus.ac.id"
                        ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      priscilla.andow@binus.ac.id
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("user@gmail.com", "01234")}
                    className={`p-2 rounded-xl text-left border text-xs transition-all ${
                      emailInput === "user@gmail.com"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>User</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      user@gmail.com
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email / Username Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isId ? "Email / Username" : "Email / Username"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nama@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isId ? "Kata Sandi" : "Password"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="•••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>{isId ? "Ingat saya" : "Remember me"}</span>
                </label>

                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setViewMode("profile")}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-[11px]"
                  >
                    {isId ? "Kembali ke Profil" : "Back to Profile"}
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isId ? "Masuk ke Sistem" : "Sign In"}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500">
          <span>{isId ? "Sistem Otentikasi Claudit" : "Claudit Secure Authentication"}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
