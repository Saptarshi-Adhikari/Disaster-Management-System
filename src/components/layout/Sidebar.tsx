import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="glass"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
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
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-border p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">DisasterAid</h1>
              <p className="text-xs text-muted-foreground">
                Emergency Response
              </p>
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

          {/* Emergency button */}
          <div className="border-t border-border p-4">
            <Button variant="emergency" size="lg" className="w-full gap-2">
              <Phone className="h-5 w-5" />
              Emergency: 100
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
