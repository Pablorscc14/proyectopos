// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AppUser = {
  id: string;
  username: string;
  role: "Administrador" | "Trabajador";
};

type AuthContextType = {
  user: User | null;          // auth.user
  session: Session | null;
  profile: AppUser | null;    // fila en public.users
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string, role: AppUser["role"]) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión inicial
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile", error);
      setProfile(null);
      return;
    }

    if (data) {
      setProfile({
        id: data.id,
        username: data.username,
        role: data.role,
      });
    } else {
      setProfile(null);
    }
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp: AuthContextType["signUp"] = async (
    email,
    password,
    username,
    role
  ) => {
    // 1) crear usuario de auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      return { error: error?.message ?? "No se pudo crear el usuario" };
    }

    // 2) crear fila en public.users
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      username,
      role,
    });

    if (insertError) {
      console.error("Error creando perfil", insertError);
      return { error: "Usuario creado en auth, pero falló la creación del perfil" };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
