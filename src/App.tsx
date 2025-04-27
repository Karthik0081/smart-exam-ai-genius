
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { AudioProvider } from "./contexts/AudioContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateExam from "./pages/AdminCreateExam";
import AdminResults from "./pages/AdminResults";
import StudentDashboard from "./pages/StudentDashboard";
import StudentExam from "./pages/StudentExam";
import StudentResults from "./pages/StudentResults";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <AudioProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                {/* Authentication redirect */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Admin routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/create-exam" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminCreateExam />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/results/:examId" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminResults />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Student routes */}
                <Route 
                  path="/student/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/exam/:examId" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentExam />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/results/:examId" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentResults />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AudioProvider>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
