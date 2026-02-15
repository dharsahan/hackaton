'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [formData, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    farmName: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;

      // 2. Create the profile document in Firestore using Email as key (or UID)
      // We'll use email to maintain compatibility with existing profile fetching logic
      const userRef = doc(db, "users", formData.email.toLowerCase());
      const userData = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        farmName: formData.farmName,
        role: "owner",
        createdAt: new Date().toISOString(),
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
        uid: user.uid
      };

      await setDoc(userRef, userData);

      // 3. Automatically sign them into NextAuth session
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but error signing in. Please try logging in.");
        setIsLoading(false);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError("Email already registered");
      } else if (firebaseError.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters");
      } else {
        setError("Registration failed. Please try again.");
      }
      setIsLoading(false);
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

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30 transform -rotate-3">
            <span className="material-icons text-white text-3xl">agriculture</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Join Farmertopia</h1>
          <p className="text-gray-300 text-sm">Create your digital farm account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative group">
              <span className="absolute left-4 top-3.5 material-icons text-gray-400 text-lg group-focus-within:text-green-400 transition-colors">person</span>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setNewUser({ ...formData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm backdrop-blur-sm"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <span className="absolute left-4 top-3.5 material-icons text-gray-400 text-lg group-focus-within:text-green-400 transition-colors">email</span>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setNewUser({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm backdrop-blur-sm"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Farm Name</label>
            <div className="relative group">
              <span className="absolute left-4 top-3.5 material-icons text-gray-400 text-lg group-focus-within:text-green-400 transition-colors">landscape</span>
              <input
                required
                type="text"
                value={formData.farmName}
                onChange={(e) => setNewUser({ ...formData, farmName: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm backdrop-blur-sm"
                placeholder="e.g. Green Valley"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-3.5 material-icons text-gray-400 text-lg group-focus-within:text-green-400 transition-colors">lock</span>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setNewUser({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm backdrop-blur-sm"
                placeholder="Min. 6 characters"
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-green-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-icons text-lg">how_to_reg</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
