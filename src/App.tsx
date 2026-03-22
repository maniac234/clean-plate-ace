import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Inspections from "@/pages/Inspections";
import Logs from "@/pages/Logs";
import Charts from "@/pages/Charts";
import Branches from "@/pages/Branches";
import InspectionSettings from "@/pages/InspectionSettings";
import UsersPage from "@/pages/Users";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function HomeRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ErrorBoundary><HomeRoute><LandingPage /></HomeRoute></ErrorBoundary>} />
            <Route path="/login" element={<ErrorBoundary><AuthRoute><Login /></AuthRoute></ErrorBoundary>} />
            <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/inspections" element={<ErrorBoundary><ProtectedRoute><Inspections /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/logs" element={<ErrorBoundary><ProtectedRoute><Logs /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/charts" element={<ErrorBoundary><ProtectedRoute><Charts /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/branches" element={<ErrorBoundary><ProtectedRoute><AdminRoute><Branches /></AdminRoute></ProtectedRoute></ErrorBoundary>} />
            <Route path="/users" element={<ErrorBoundary><ProtectedRoute><AdminRoute><UsersPage /></AdminRoute></ProtectedRoute></ErrorBoundary>} />
            <Route path="/settings" element={<ErrorBoundary><ProtectedRoute><AdminRoute><InspectionSettings /></AdminRoute></ProtectedRoute></ErrorBoundary>} />
            <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
