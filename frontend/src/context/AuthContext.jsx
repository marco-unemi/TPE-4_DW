import { createContext, useContext, useState } from "react";

const AuthContext = createContext(undefined);

const readStoredUsuario = () => {
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // Read synchronously (lazy initializer) so the very first render already
  // reflects a stored session. Doing this in a useEffect instead would leave
  // isAuthenticated=false for one commit, and react-router's <Navigate>
  // fires its redirect from an effect that runs before a parent provider's
  // effect, which would incorrectly bounce an already-logged-in user to
  // /login on every page refresh of a protected route.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(() => readStoredUsuario());

  const login = (newToken, newUsuario) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("usuario", JSON.stringify(newUsuario));
    setToken(newToken);
    setUsuario(newUsuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  const value = {
    usuario,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
