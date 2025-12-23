/**
 * ========================================
 * App.tsx - MAIN APPLICATION FILE
 * ========================================
 * 
 * This is the starting point of the entire application.
 * Think of it like the "main entrance" of a building.
 * 
 * WHAT THIS FILE DOES:
 * 1. Sets up the navigation (which page shows when you click a link)
 * 2. Wraps everything with providers (helpers that make features work)
 * 3. Defines all the pages/routes in the app
 */

// ---- IMPORTS ----
// These are like getting tools from a toolbox - we need them to build our app

// Toast components - these show popup messages (like "Success!" or "Error!")
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Tooltip provider - enables hover tooltips throughout the app
import { TooltipProvider } from "@/components/ui/tooltip";

// Query tools - helps fetch and manage data from servers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Router - handles navigation between pages (like clicking links)
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout - the main wrapper with sidebar and header
import { Layout } from "@/components/layout/Layout";

// ---- PAGE IMPORTS ----
// Each of these is a different page in our app
import Dashboard from "@/pages/Dashboard";        // Home page with overview
import SOS from "@/pages/SOS";                    // Emergency SOS page
import Shelters from "@/pages/Shelters";          // Find shelters page
import MissingPersons from "@/pages/MissingPersons"; // Missing persons page
import Resources from "@/pages/Resources";        // Resource matching page
import Alerts from "@/pages/Alerts";              // Alerts and news page
import FirstAid from "@/pages/FirstAid";          // First aid guide page
import SafetyCheck from "@/pages/SafetyCheck";    // Safety check page
import NotFound from "@/pages/NotFound";          // 404 error page

// Create a query client - this helps manage data fetching
const queryClient = new QueryClient();

/**
 * THE MAIN APP COMPONENT
 * 
 * This component wraps everything together:
 * - QueryClientProvider: Makes data fetching work
 * - TooltipProvider: Makes tooltips work
 * - Toaster/Sonner: Shows popup messages
 * - BrowserRouter: Makes page navigation work
 * - Layout: Adds the sidebar and header to every page
 * - Routes: Defines which page shows for each URL
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* These show popup notifications */}
      <Toaster />
      <Sonner />
      
      {/* BrowserRouter enables page navigation */}
      <BrowserRouter>
        {/* Layout wraps all pages with sidebar and header */}
        <Layout>
          {/* Routes define which page shows for each URL */}
          <Routes>
            {/* 
              Each Route is like a door:
              - path = the URL (what you type in the browser)
              - element = the page component that shows
            */}
            <Route path="/" element={<Dashboard />} />           {/* Home page */}
            <Route path="/sos" element={<SOS />} />              {/* SOS emergency */}
            <Route path="/shelters" element={<Shelters />} />    {/* Find shelters */}
            <Route path="/missing" element={<MissingPersons />} /> {/* Missing persons */}
            <Route path="/resources" element={<Resources />} />  {/* Resource matching */}
            <Route path="/alerts" element={<Alerts />} />        {/* Alerts & news */}
            <Route path="/first-aid" element={<FirstAid />} />   {/* First aid guide */}
            <Route path="/safety" element={<SafetyCheck />} />   {/* Safety check */}
            <Route path="*" element={<NotFound />} />            {/* 404 page (any unknown URL) */}
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Export the App so it can be used in main.tsx
export default App;
