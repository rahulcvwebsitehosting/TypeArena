import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SinglePlayer from "./pages/SinglePlayer";
import Multiplayer from "./pages/Multiplayer";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import About from "./pages/About";
import { Loader2, Layers } from "lucide-react";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void">
        <div className="flex items-center gap-3 mb-4 animate-pulse">
          <Layers className="text-neon-purple" size={32} />
          <h1 className="text-3xl font-bold text-white">
            TYPE<span className="text-neon-cyan">ARENA</span>
          </h1>
        </div>
        <Loader2 className="animate-spin text-neon-purple" size={40} />
        <p className="mt-4 text-slate-500 font-mono text-sm tracking-widest uppercase">
          Initializing Systems...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  const { loading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/singleplayer"
        element={
          <ProtectedRoute>
            <SinglePlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/multiplayer"
        element={
          <ProtectedRoute>
            <Multiplayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
