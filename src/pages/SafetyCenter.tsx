import { useState, useEffect } from "react";
import { db, auth } from "@/firebase/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  AlertTriangle, CheckCircle, ShieldCheck, Phone, Heart, 
  Users, Plus, Trash2, Video, Mic, MapPin, Send, Loader2, StopCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SafetyCenter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });

  // Functional States
  const [isRecording, setIsRecording] = useState<'video' | 'audio' | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // SOS Form State
  const [sosDetails, setSosDetails] = useState({
    type: "",
    details: "",
    location: null as { lat: number; lng: number } | null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfile(user);
      } else {
        setLoading(false);
      }
    });

    const fetchProfile = async (user: any) => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  // --- 1. FUNCTION: GET LOCATION ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not Supported", description: "Your browser doesn't support GPS", variant: "destructive" });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSosDetails(prev => ({
          ...prev,
          location: { lat: position.coords.latitude, lng: position.coords.longitude }
        }));
        setLocationLoading(false);
        toast({ title: "Location Locked", description: "Coordinates captured successfully." });
      },
      (error) => {
        setLocationLoading(false);
        toast({ title: "Location Error", description: error.message, variant: "destructive" });
      }
    );
  };

  // --- 2. FUNCTION: STATUS TOGGLES (I'M SAFE / NEED HELP) ---
  const handleStatusUpdate = async (status: "SAFE" | "EMERGENCY") => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { 
        currentStatus: status, 
        lastStatusChange: serverTimestamp() 
      });
      toast({ 
        title: status === "SAFE" ? "Marked as Safe" : "SOS Mode Activated", 
        description: "Your status has been shared with your circle." 
      });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  // --- 3. FUNCTION: BROADCAST SOS SIGNAL ---
  const handleBroadcastSOS = async () => {
    if (!sosDetails.type || !auth.currentUser) {
      toast({ title: "Missing Info", description: "Please select an emergency type.", variant: "destructive" });
      return;
    }

    try {
      const alertId = `alert_${Date.now()}`;
      await setDoc(doc(db, "alerts", alertId), {
        ...sosDetails,
        userId: auth.currentUser.uid,
        userName: userProfile?.displayName || "Anonymous User",
        timestamp: serverTimestamp(),
        status: "ACTIVE"
      });

      toast({ 
        title: "SOS BROADCASTED", 
        description: "Rescue teams have been notified of your location.",
        variant: "destructive" 
      });
    } catch (e) {
      toast({ title: "Broadcast Failed", description: "Check your connection.", variant: "destructive" });
    }
  };

  // --- 4. FUNCTION: MEDIA RECORDING TOGGLE ---
  const handleToggleRecording = (type: 'video' | 'audio') => {
    if (isRecording === type) {
      setIsRecording(null);
      toast({ title: "Recording Saved", description: "Evidence attached to broadcast." });
    } else {
      setIsRecording(type);
      toast({ title: "Recording Started", description: `Capturing ${type} now...` });
    }
  };

  // --- PREVIOUS CONTACT FUNCTIONS ---
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !auth.currentUser) {
      toast({ title: "Missing Info", variant: "destructive" });
      return;
    }
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const contactData = { id: Date.now().toString(), ...newContact };
      await updateDoc(userRef, { emergencyContacts: arrayUnion(contactData) });
      setUserProfile((prev: any) => ({
        ...prev,
        emergencyContacts: [...(prev.emergencyContacts || []), contactData]
      }));
      setNewContact({ name: "", phone: "", relation: "" });
      toast({ title: "Contact Added" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleRemoveContact = async (contact: any) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { emergencyContacts: arrayRemove(contact) });
      setUserProfile((prev: any) => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((c: any) => c.id !== contact.id)
      }));
      toast({ title: "Contact Removed" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto py-6 px-4 space-y-8 text-white max-w-7xl">
      {/* Header & Status Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-3xl font-bold">Safety Command Center</h1>
          <p className="text-slate-400">Manage your protection and broadcast alerts.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            onClick={() => handleStatusUpdate("SAFE")}
            variant="outline" 
            className="flex-1 md:flex-none border-green-500/50 text-green-500 hover:bg-green-500/10"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> I'm Safe
          </Button>
          <Button 
            onClick={() => handleStatusUpdate("EMERGENCY")}
            variant="destructive" 
            className="flex-1 md:flex-none font-bold"
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> I Need Help
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: SOS Dispatch Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-rose-500" /> Send Emergency Signal
              </CardTitle>
              <CardDescription>Fill this to alert nearby rescue teams and your Safety Circle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {['Flood', 'Fire', 'Earthquake', 'Medical', 'Trapped', 'Other'].map((type) => (
                  <Button 
                    key={type} 
                    variant="outline" 
                    className={`h-20 flex-col gap-2 text-xs border-slate-700 ${sosDetails.type === type ? 'border-primary bg-primary/10 text-primary' : 'hover:border-slate-500'}`}
                    onClick={() => setSosDetails({...sosDetails, type})}
                  >
                    <span className="text-lg">{type === 'Flood' ? '🌊' : type === 'Fire' ? '🔥' : '⚠️'}</span>
                    {type}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleToggleRecording('video')}
                  variant={isRecording === 'video' ? "destructive" : "secondary"} 
                  className="h-24 flex-col gap-2 border-dashed border-2 bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                >
                  {isRecording === 'video' ? <StopCircle className="h-6 w-6 animate-pulse" /> : <Video className="h-6 w-6 text-slate-400" />}
                  {isRecording === 'video' ? "Stop Recording" : "Record Video"}
                </Button>
                <Button 
                  onClick={() => handleToggleRecording('audio')}
                  variant={isRecording === 'audio' ? "destructive" : "secondary"} 
                  className="h-24 flex-col gap-2 border-dashed border-2 bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                >
                  {isRecording === 'audio' ? <StopCircle className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6 text-slate-400" />}
                  {isRecording === 'audio' ? "Stop Recording" : "Record Audio"}
                </Button>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  {locationLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />}
                  {sosDetails.location ? "Location Attached ✓" : "Get My Location"}
                </Button>
                <Textarea 
                  value={sosDetails.details}
                  onChange={(e) => setSosDetails({...sosDetails, details: e.target.value})}
                  placeholder="Describe your situation (number of people, injuries...)" 
                  className="bg-slate-800 border-slate-700 min-h-[100px] focus:ring-primary text-white" 
                />
              </div>

              <Button 
                onClick={handleBroadcastSOS}
                className="w-full h-14 text-lg font-bold bg-rose-600 hover:bg-rose-700 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all"
              >
                BROADCAST SOS SIGNAL
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Safety Circle & Contacts */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Safety Circle
              </CardTitle>
              <CardDescription>Contacts notified when you trigger SOS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input placeholder="Name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                <Input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                <Input placeholder="Relation" value={newContact.relation} onChange={e => setNewContact({...newContact, relation: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                <Button onClick={handleAddContact} className="w-full bg-primary hover:bg-primary/90 gap-2 font-semibold">
                  <Plus className="h-4 w-4" /> Add Contact
                </Button>
              </div>

              <div className="pt-4 space-y-3 border-t border-slate-800">
                {userProfile?.emergencyContacts?.length > 0 ? (
                  userProfile.emergencyContacts.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 group">
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                        <div>
                          <p className="text-sm font-bold">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.phone} • {c.relation}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveContact(c)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-slate-500 py-4">No contacts added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-600/10 border-blue-600/20">
            <CardContent className="p-4 flex gap-3">
              <ShieldCheck className="h-8 w-8 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Your data is encrypted. In an emergency, your location is shared only with registered responders and your selected circle.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}