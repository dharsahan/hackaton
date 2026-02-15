import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { auth, db } from "./firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Firebase Auth",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // 1. Authenticate with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          const user = userCredential.user;

          if (user) {
            // 2. Fetch additional profile data from Firestore
            const userRef = doc(db, "users", user.email!.toLowerCase());
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            return {
              id: user.uid,
              name: userData?.name || user.displayName || credentials.email.split('@')[0],
              email: user.email,
              image: userData?.image || user.photoURL,
            };
          }
        } catch (error) {
          const authError = error as { code?: string; message?: string };
          console.error("Firebase Auth error:", authError.code, authError.message);
          
          // Fallback for demo account if Firebase Auth is not yet configured with this user
          if (credentials.email === "farmer@farmertopia.com" && credentials.password === "password") {
            return { 
              id: "farmer-demo", 
              name: "Farmer John", 
              email: "farmer@farmertopia.com", 
              image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer" 
            };
          }
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        const userRef = doc(db, "users", user.email.toLowerCase()); 
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: user.name,
            email: user.email,
            image: user.image,
            role: "owner",
            createdAt: new Date().toISOString(),
            farmName: "My Farm",
            location: "Salem, TN"
          }, { merge: true });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    }
  }
}
