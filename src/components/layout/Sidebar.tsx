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
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Zap // Icon for Safety Center
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth, db } from "@/firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: ShieldCheck, label: "Safety Circle", path: "/profile" },
  // Unified Safety Center replacing the two individual links
  { icon: Zap, label: "Safety Center", path: "/safety-center" }, 
  { icon: MapPin, label: "Shelter Finder", path: "/shelters" },
  { icon: Users, label: "Missing Persons", path: "/missing" },
  { icon: Heart, label: "Resource Match", path: "/resources" },
  { icon: Radio, label: "Alerts & News", path: "/alerts" },
  { icon: FileText, label: "First Aid Guide", path: "/first-aid" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<{name: string, photo: string}>({
    name: "View Profile",
    photo: ""
  });
  
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Real-time listener for the user's Firestore document
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              name: data.displayName || "View Profile",
              photo: data.photoURL || ""
            });
          }
        });
        return () => unsubscribeDoc();
      }
    });

    return () => unsubscribeAuth();
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
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-background/50 backdrop-blur"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-border p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">WB-Relief</h1>
              <p className="text-xs text-muted-foreground">Command Center</p>
            </div>
          </div>

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
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4 space-y-3 bg-secondary/10">
            {user ? (
              <div className="space-y-3">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 p-2 bg-background/50 rounded-xl border border-border/50 hover:border-blue-500/50 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600/40 overflow-hidden">
                    {profileData.photo ? (
                      <img src={profileData.photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate">
                      {profileData.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      Manage Contacts
                    </p>
                  </div>
                </Link>
                
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
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                   Sign In
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none" onClick={() => navigate("/register")}>
                   Sign Up
                </Button>
              </div>
            )}

            <Button 
              variant="destructive" 
              size="lg" 
              className="w-full gap-2 font-bold uppercase tracking-wide bg-red-600 hover:bg-red-700 "
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