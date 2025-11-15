import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  name?: string;
  sessionsCount?: number;
  joinedDate?: string;
  lastLogin?: string;
  phone?: string | null;
  daysActive?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore user session on page reload
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to restore session");

        const data = await response.json();

        const rawRole =
          typeof data.role === "string"
            ? data.role
            : data.role?.name || "user";

        const normalizedRole = rawRole.toLowerCase().includes("admin")
          ? "admin"
          : "user";

        setUser({
          id: data.id.toString(),
          email: data.email || data.username,
          username: data.username,
          role: normalizedRole,
          name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
          sessionsCount: data.session_count || 0,
          joinedDate: data.user.created_at,
          lastLogin: data.last_login,
          phone: data.user.phone_number,
          daysActive: data.days_active,
        });
      } catch (error) {
        console.error("Session restore failed:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // ✅ Login
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();

      localStorage.setItem("token", data.access_token);

      const rawRole =
        typeof data.user.role === "string"
          ? data.user.role
          : data.user.role?.name || "user";

      const normalizedRole = rawRole.toLowerCase().includes("admin")
        ? "admin"
        : "user";

      const userData: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        username: data.user.username,
        role: normalizedRole,
        name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
        sessionsCount: data.session_count || 0,
        joinedDate: data.user.created_at,
        lastLogin: data.last_login,
        phone: data.user.phone_number,
        daysActive: data.days_active,
      };

      setUser(userData);
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // ✅ Register
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/user/create_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
          full_name: name,
          role_name: "user",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
      console.log("✅ User registered successfully:", data);

      await login(email, password);
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to refresh user");

      const data = await res.json();

      const rawRole =
        typeof data.role === "string"
          ? data.role
          : data.role?.name || "user";

      const normalizedRole = rawRole.toLowerCase().includes("admin")
        ? "admin"
        : "user";

      setUser({
        id: data.id.toString(),
        email: data.email || data.username,
        username: data.username,
        role: normalizedRole,
        name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
        sessionsCount: data.session_count || 0,
        joinedDate: data.user.created_at,
        lastLogin: data.last_login,
        phone: data.user.phone_number,
        daysActive: data.days_active,
      });
    } catch (err) {
      console.error("refreshUser failed:", err);
    }
  };


  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
