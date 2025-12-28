import { useState, useEffect, useCallback } from "react";
import { db, auth } from "@/firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Cropper from "react-easy-crop"; // New library for crop
import { 
  User as UserIcon, 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Phone, 
  Heart,
  Loader2,
  Camera,
  Check,
  X,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [displayName, setDisplayName] = useState("");

  // --- Cropper States ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfile(user);
      } else {
        setLoading(false);
      }
    });

    const fetchProfile = async (currentUser: any) => {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile(data);
          setDisplayName(data.displayName || "");
        } else {
          const initialData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "User",
            photoURL: "",
            emergencyContacts: []
          };
          await setDoc(docRef, initialData);
          setUserProfile(initialData);
          setDisplayName(initialData.displayName);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  // --- NEW: Cropping Logic ---
  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageToCrop(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels || !auth.currentUser) return;
    setUploading(true);

    try {
      const image = new Image();
      image.src = imageToCrop;
      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const { width, height, x, y } = croppedAreaPixels as any;
      canvas.width = 300; // Standard profile size
      canvas.height = 300;

      ctx?.drawImage(image, x, y, width, height, 0, 0, 300, 300);
      
      const base64String = canvas.toDataURL("image/jpeg", 0.8);

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: base64String });

      setUserProfile((prev: any) => ({ ...prev, photoURL: base64String }));
      setImageToCrop(null); // Close the cropper
      toast({ title: "Success", description: "Profile picture updated!" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to crop image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePic = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: "" });
      setUserProfile((prev: any) => ({ ...prev, photoURL: "" }));
      toast({ title: "Photo Removed", description: "Your profile picture has been deleted." });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const updateName = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { displayName: displayName });
      setUserProfile((prev: any) => ({ ...prev, displayName: displayName }));
      toast({ title: "Name Updated", description: "Your name has been synced to your profile." });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone || !auth.currentUser) {
      toast({ title: "Missing Info", variant: "destructive" });
      return;
    }
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const contactId = Date.now().toString();
      const contactData = { id: contactId, ...newContact };
      await updateDoc(userRef, { emergencyContacts: arrayUnion(contactData) });
      setUserProfile((prev: any) => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, contactData] }));
      setNewContact({ name: "", phone: "", relation: "" });
      toast({ title: "Contact Added" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const removeContact = async (contact: any) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { emergencyContacts: arrayRemove(contact) });
      setUserProfile((prev: any) => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter((c: any) => c.id !== contact.id) }));
      toast({ title: "Contact Removed" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8 text-white relative">
      
      {/* --- WHATSAPP STYLE CROP OVERLAY --- */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border border-slate-800">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          
          <div className="w-full max-w-md mt-8 space-y-6">
            <div className="space-y-4 px-4">
              <Label className="text-slate-400 text-xs uppercase tracking-widest">Zoom Level</Label>
              <input 
                type="range" 
                min={1} 
                max={3} 
                step={0.1} 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 text-white hover:bg-slate-900" onClick={() => setImageToCrop(null)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2" onClick={createCroppedImage} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Apply Photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 overflow-hidden shadow-2xl">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-10 w-10 text-primary" />
            )}
          </div>
          
          <div className="absolute -bottom-1 -right-1 flex flex-col gap-1">
            <label className="p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-all shadow-lg border-2 border-slate-900">
              <Camera className="h-3 w-3 text-white" />
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
            
            {userProfile?.photoURL && (
              <button 
                onClick={deleteProfilePic}
                className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-all shadow-lg border-2 border-slate-900"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-2xl font-bold w-full md:w-64 h-10"
              placeholder="Your Name"
            />
            <Button onClick={updateName} size="sm" variant="outline" className="h-10 gap-2 border-primary/50 text-primary hover:bg-primary/10">
              <Check className="h-4 w-4" /> Save Name
            </Button>
          </div>
          <p className="text-slate-400">{userProfile?.email}</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plus className="h-5 w-5" /> Add Safety Contact
            </CardTitle>
            <CardDescription>Details saved directly to your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="Family member name" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="+91..." className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Input value={newContact.relation} onChange={e => setNewContact({...newContact, relation: e.target.value})} placeholder="e.g. Father, Friend" className="bg-slate-800 border-slate-700" />
            </div>
            <Button onClick={addContact} className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-semibold">
              <ShieldCheck className="h-4 w-4" /> Sync to Safety Circle
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> My Safety Circle
          </h3>
          {userProfile?.emergencyContacts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">No contacts synced yet.</div>
          ) : (
            userProfile?.emergencyContacts.map((contact: any) => (
              <Card key={contact.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center"><Heart className="h-5 w-5 text-rose-500" /></div>
                    <div>
                      <p className="font-bold text-white">{contact.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.phone} • {contact.relation}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeContact(contact)} className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}