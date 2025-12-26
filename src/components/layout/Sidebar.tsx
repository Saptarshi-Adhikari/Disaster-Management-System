import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Home,
  MapPin,
  Users,
  Heart,
  Radio,
  FileText,
  Shield,
  Menu,
  X,
  Phone,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" }, 
  { icon: AlertTriangle, label: "SOS Emergency", path: "/sos" },
  { icon: MapPin, label: "Shelter Finder", path: "/shelters" },
  { icon: Users, label: "Missing Persons", path: "/missing" },
  { icon: Heart, label: "Resource Match", path: "/resources" },
  { icon: Radio, label: "Alerts & News", path: "/alerts" },
  { icon: FileText, label: "First Aid Guide", path: "/first-aid" },
  { icon: Shield, label: "Safety Check", path: "/safety" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile toggle button - glass variant */}
      <Button
        variant="glass"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay - backdrop blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="flex items-center gap-3 border-b border-border p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-blue-500/20">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">DisasterAid</h1>
              <p className="text-xs text-muted-foreground">Emergency Response</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Action Area */}
          <div className="border-t border-border p-4 space-y-3 bg-secondary/10">
            {user ? (
              // LOGGED IN: Profile + Logout
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-background/50 rounded-xl border border-border/50">
                  <div className="h-9 w-9 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.displayName || "Verified Responder"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              // LOGGED OUT: Sign In + Sign Up
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-1 border-slate-700"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="w-full gap-1 bg-green-600 hover:bg-green-700 text-white border-none"
                  onClick={() => navigate("/register")}
                >
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Button>
              </div>
            )}

            {/* Emergency button */}
            <Button 
              variant="emergency" 
              size="lg" 
              className="w-full gap-2 font-bold uppercase tracking-wide"
              onClick={() => window.location.href = 'tel:100'}
            >
              <Phone className="h-5 w-5" />
              Emergency: 100
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}