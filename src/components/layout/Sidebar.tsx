/**
 * ========================================
 * Sidebar.tsx - NAVIGATION SIDEBAR
 * ========================================
 * 
 * This is the sidebar menu that appears on the left side of the screen.
 * It contains navigation links to all pages in the app.
 * 
 * FEATURES:
 * - Shows all navigation links
 * - Highlights the current page
 * - Collapsible on mobile devices
 * - Emergency call button at the bottom
 */

// ---- IMPORTS ----

// useState: Lets us remember if the mobile menu is open or closed
// Link, useLocation: Helps with navigation between pages
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Icons - the little pictures next to each menu item
import { 
  AlertTriangle,  // ⚠️ SOS/Emergency
  Home,           // 🏠 Dashboard
  MapPin,         // 📍 Shelters
  Users,          // 👥 Missing Persons
  Heart,          // ❤️ Resources
  Radio,          // 📻 Alerts
  FileText,       // 📄 First Aid
  Shield,         // 🛡️ Safety/Logo
  Menu,           // ☰ Hamburger menu (mobile)
  X,              // ✕ Close button
  Phone           // 📞 Phone icon
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";  // Helper for combining CSS classes

/**
 * NAVIGATION ITEMS
 * 
 * This is a list of all menu items in the sidebar.
 * Each item has:
 * - icon: The picture shown next to the text
 * - label: The text shown in the menu
 * - path: The URL to go to when clicked
 */
const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: AlertTriangle, label: "SOS Emergency", path: "/sos" },
  { icon: MapPin, label: "Shelter Finder", path: "/shelters" },
  { icon: Users, label: "Missing Persons", path: "/missing" },
  { icon: Heart, label: "Resource Match", path: "/resources" },
  { icon: Radio, label: "Alerts & News", path: "/alerts" },
  { icon: FileText, label: "First Aid Guide", path: "/first-aid" },
  { icon: Shield, label: "Safety Check", path: "/safety" },
];

/**
 * SIDEBAR COMPONENT
 */
export function Sidebar() {
  // ---- STATE ----
  // isOpen: Remembers if mobile menu is open (true) or closed (false)
  const [isOpen, setIsOpen] = useState(false);
  
  // location: Tells us which page we're currently on
  const location = useLocation();

  return (
    <>
      {/* ============================================
          MOBILE MENU BUTTON
          Only shows on small screens (phones)
          ============================================ */}
      <Button
        variant="glass"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"  // "md:hidden" means hide on medium+ screens
        onClick={() => setIsOpen(!isOpen)}  // Toggle open/closed when clicked
      >
        {/* Show X when open, hamburger menu when closed */}
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* ============================================
          OVERLAY (DARK BACKGROUND)
          Shows behind sidebar when menu is open on mobile
          Clicking it closes the menu
          ============================================ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}  // Close menu when clicking overlay
        />
      )}

      {/* ============================================
          MAIN SIDEBAR
          The actual sidebar with logo and navigation links
          ============================================ */}
      <aside
        className={cn(
          // Base styles: fixed position, full height, 256px wide
          "fixed left-0 top-0 z-40 h-screen w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out",
          // Always visible on desktop (md:translate-x-0)
          "md:translate-x-0",
          // On mobile: slide in when open, hide when closed
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          
          {/* ---- LOGO SECTION ---- */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            {/* Logo icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            {/* App name */}
            <div>
              <h1 className="text-lg font-bold">DisasterAid</h1>
              <p className="text-xs text-muted-foreground">Emergency Response</p>
            </div>
          </div>

          {/* ---- NAVIGATION LINKS ---- */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {/* Loop through each navigation item and create a link */}
            {navItems.map((item) => {
              // Check if this is the current page
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}  // Unique identifier for React
                  to={item.path}   // Where to go when clicked
                  onClick={() => setIsOpen(false)}  // Close mobile menu when clicked
                  className={cn(
                    // Base link styles
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    // Different styles if this is the current page
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow-primary"  // Active: highlighted
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"  // Inactive: muted
                  )}
                >
                  {/* Icon - using the icon from navItems */}
                  <item.icon className="h-5 w-5" />
                  {/* Label text */}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ---- EMERGENCY CONTACT BUTTON ---- */}
          <div className="p-4 border-t border-border">
            <Button variant="emergency" className="w-full" size="lg">
              <Phone className="h-5 w-5" />
              Emergency: 911
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
