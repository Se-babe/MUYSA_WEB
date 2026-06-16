import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuth, registerUser, loginUser, logoutUser, mapAuthError, resetPassword } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((profile) => {
      setUser(profile);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const profile = await loginUser(email, password);
      setUser(profile);
      return { user: profile };
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  };

  const register = async (data) => {
    try {
      const profile = await registerUser(data);
      setUser(profile);
      return { user: profile };
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));

  const hasRole = (...roles) => user && roles.includes(user.role);

  const forgotPassword = async (email) => {
    try {
      await resetPassword(email);
    } catch (err) {
      throw new Error(mapAuthError(err));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
