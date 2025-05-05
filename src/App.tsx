
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/NotesPage";
import GoalsPage from "./pages/GoalsPage";
import SubjectsPage from "./pages/SubjectsPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route element={<AuthGuard requireAuth={false} />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<AuthGuard requireAuth={true} />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
