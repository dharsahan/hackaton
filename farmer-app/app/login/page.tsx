'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("farmer@farmertopia.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-black/80 z-10" />
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30 transform rotate-3">
            <span className="material-icons text-white text-3xl">eco</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-300 text-sm">Enter your credentials to access your farm</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <span className="absolute left-4 top-3.5 material-icons text-gray-400 text-lg group-focus-within:text-green-400 transition-colors">email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm backdrop-blur-sm"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-3.5 material-icons text-gray-400 text-lg group-focus-within:text-green-400 transition-colors">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm backdrop-blur-sm"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
              <span className="material-icons text-red-400 text-sm">error</span>
              <p className="text-red-200 text-xs font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-green-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-icons text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-gray-400 bg-opacity-0 backdrop-blur-xl">Or continue with</span>
          </div>
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl py-2.5 transition-all group">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-gray-300 text-sm font-medium group-hover:text-white">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl py-2.5 transition-all group">
            <img src="https://www.svgrepo.com/show/475654/github-color.svg" alt="GitHub" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity bg-white/10 rounded-full" />
            <span className="text-gray-300 text-sm font-medium group-hover:text-white">GitHub</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center bg-black/20 mx-[-2rem] mb-[-2rem] p-4 rounded-b-3xl border-t border-white/5">
          <p className="text-[11px] text-gray-400">
            Demo: <span className="text-green-400 font-mono bg-green-400/10 px-1 py-0.5 rounded">farmer@farmertopia.com</span> / <span className="text-green-400 font-mono bg-green-400/10 px-1 py-0.5 rounded">password</span>
          </p>
        </div>
      </div>
    </div>
  );
}
