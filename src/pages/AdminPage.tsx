import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Loader2, Lock } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard"; 
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// The only phone number authorized for Admin access
const ADMIN_PHONE = "+917029786817";

export function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-primary h-10 w-10" />
      </div>
    );
  }

  // Verification Logic
  const isAdmin = user?.phoneNumber === ADMIN_PHONE;

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <Lock className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold">Admin Access Only</h1>
        <p className="text-slate-400 text-center mt-2 max-w-xs">
          Your number ({user?.phoneNumber || "Not Logged In"}) is not authorized.
        </p>
        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

// THIS LINE FIXES THE ERROR
export default AdminPage;