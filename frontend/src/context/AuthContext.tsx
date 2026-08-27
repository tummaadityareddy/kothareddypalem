import {createContext, useContext, useEffect, useState, type ReactNode, } from "react";
import {getCurrentUser, login as loginApi, type CurrentUser,} from "../services/api";

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({children,}: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { async function loadUser() {
    const storedToken = localStorage.getItem("token");
    
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
        const currentUser = await getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(currentUser);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await loginApi({email, password,});

    localStorage.setItem("token", response.token);
    setToken(response.token);

    const currentUser = await getCurrentUser(response.token);
    setUser(currentUser);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{user, token, loading, login, logout,}}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}