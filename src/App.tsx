/**
 * App.tsx - MAIN APPLICATION FILE
 */

import { Routes, Route } from "react-router-dom"

// UI
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

// Data
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Layout
import { Layout } from "@/components/layout/Layout"

// Pages
import Index from "@/pages/Index"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Dashboard from "@/pages/Dashboard"
import ResetPassword from "@/pages/ResetPassword"; // 1. IMPORT YOUR NEW PAGE
import SOS from "@/pages/SOS"
import Shelters from "@/pages/Shelters"
import MissingPersons from "@/pages/MissingPersons"
import Resources from "@/pages/Resources"
import Alerts from "@/pages/Alerts"
import FirstAid from "@/pages/FirstAid"
import SafetyCheck from "@/pages/SafetyCheck"
import NotFound from "@/pages/NotFound"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. ADD THE RESET PASSWORD ROUTE HERE */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* PROTECTED / APP ROUTES */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/missing" element={<MissingPersons />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/first-aid" element={<FirstAid />} />
            <Route path="/safety" element={<SafetyCheck />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App