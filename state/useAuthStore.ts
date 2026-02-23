"use client";

import { create } from "zustand";
import { produce } from "immer";
import { authClient } from "@/lib/auth/client";

export type UserRole = "super-admin" | "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: {
    id: string;
    token?: string;
    expiresAt: Date;
  } | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setSession: (
    session: {
      id: string;
      token?: string;
      expiresAt: Date;
    } | null,
  ) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  session: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  setUser: (user) =>
    set(
      produce((state: AuthState) => {
        state.user = user;
        state.isAuthenticated = !!user;
      }),
    ),

  setSession: (session) =>
    set(
      produce((state: AuthState) => {
        state.session = session;
      }),
    ),

  setRole: (role) =>
    set(
      produce((state: AuthState) => {
        state.role = role;
      }),
    ),

  setLoading: (loading) =>
    set(
      produce((state: AuthState) => {
        state.isLoading = loading;
      }),
    ),

  initialize: async () => {
    const { setLoading, setUser, setSession, setRole } = get();
    setLoading(true);

    try {
      const session = await authClient.getSession();

      if (session?.data?.user && session?.data?.session) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email ?? "",
          name: session.data.user.name ?? undefined,
          emailVerified: session.data.user.emailVerified ?? false,
          image: session.data.user.image ?? undefined,
        });

        setSession({
          id: session.data.session.id ?? session.data.session.token ?? "",
          token: session.data.session.token,
          expiresAt: new Date(
            session.data.session.expiresAt ?? Date.now() + 86400000,
          ),
        });

        // Fetch user role from backend
        try {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
          const token = session.data.session.token;

          if (token) {
            const response = await fetch(`${backendUrl}/api/users/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const userData = await response.json();
              setRole(userData.role || "user");
            }
          }
        } catch (_error) {
          setRole("user"); // Default role
        }
      } else {
        setUser(null);
        setSession(null);
        setRole(null);
      }
    } catch (_error) {
      setUser(null);
      setSession(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  },

  signOut: async () => {
    const { setUser, setSession, setRole } = get();

    try {
      await authClient.signOut();
    } catch (_error) {
      // Sign out failed silently; clear local state regardless
    } finally {
      setUser(null);
      setSession(null);
      setRole(null);
    }
  },

  refreshSession: async () => {
    const { initialize } = get();
    await initialize();
  },
}));
