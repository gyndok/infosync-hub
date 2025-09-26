import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NewsDemo from "./pages/NewsDemo";
import NewsHeatmap from "./pages/NewsHeatmap";
import ApiHealthDashboard from "./components/admin/ApiHealthDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/api-health" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-dashboard-bg p-6">
                    <div className="max-w-7xl mx-auto">
                      <ApiHealthDashboard />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/demo/news" 
              element={
                <ProtectedRoute>
                  <NewsDemo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/news-heatmap" 
              element={<NewsHeatmap />} 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
