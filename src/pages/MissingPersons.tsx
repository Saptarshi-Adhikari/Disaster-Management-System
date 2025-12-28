import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { db, auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import Cropper from "react-easy-crop"; // Required: npm install react-easy-crop
import {
  Users,
  Search,
  Plus,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Camera,
  X,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Status = "missing" | "found" | "searching";
const ADMIN_PHONE = "+917029786817";

interface Person {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastSeen: any; 
  lastLocation: string;
  district: string;
  description: string;
  status: Status;
  reportedAt: any;
  contact: string;
  status_approval?: string;
  image?: string; // Added for image support
}

const statusConfig: Record<Status, { label: string; color: string; icon: any }> = {
  missing: { label: "Missing", color: "bg-rose-500/10 text-rose-600 border-rose-200", icon: AlertTriangle },
  searching: { label: "Active Search", color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Search },
  found: { label: "Found Safe", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle },
};

export default function MissingPersons() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- NEW IMAGE STATES ---
  const [previewOpen, setPreviewOpen] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [form, setForm] = useState({ 
    name: "", age: "", district: "", lastLocation: "", description: "", contact: "", image: "" 
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "missing_persons"), where("status_approval", "==", "approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Person[];
      setPersons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- IMAGE HELPER FUNCTIONS ---
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageToCrop(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = imageToCrop!;
      await new Promise((res) => (img.onload = res));

      const ctx = canvas.getContext("2d");
      canvas.width = 300; // Optimal size for Firebase/Performance
      canvas.height = 300;

      if (ctx && croppedAreaPixels) {
        const { x, y, width, height } = croppedAreaPixels as any;
        ctx.drawImage(img, x, y, width, height, 0, 0, 300, 300);
        const base64Image = canvas.toDataURL("image/jpeg", 0.7); // 0.7 compression
        setForm({ ...form, image: base64Image });
        setImageToCrop(null);
      }
    } catch (e) {
      toast({ title: "Error cropping image", variant: "destructive" });
    }
  };

  const reportPerson = async () => {
    if (!form.name || !form.contact.trim() || !form.age) {
      toast({ title: "Missing Information", description: "Name, Age, and Contact Phone are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "missing_persons"), {
        ...form,
        age: Number(form.age),
        gender: "Not Specified",
        lastSeen: Timestamp.now(),
        status: "missing",
        reportedAt: Timestamp.now(),
        status_approval: "pending" 
      });

      setForm({ name: "", age: "", district: "", lastLocation: "", description: "", contact: "", image: "" });
      setOpen(false);
      toast({ title: "Report Submitted", description: "Waiting for admin verification." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit." });
    } finally { setIsSubmitting(false); }
  };

  const formatDate = (date: any) => {
    try {
      if (!date) return "Unknown";
      const d = date instanceof Timestamp ? date.toDate() : new Date(date);
      return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) { return "Recent"; }
  };

  const filtered = persons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.district.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-10">
      {/* FULL SCREEN IMAGE PREVIEW MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setPreviewOpen(null)}>
          <button className="absolute right-6 top-6 text-white hover:text-rose-500 transition-colors">
            <X className="h-10 w-10" />
          </button>
          <img src={previewOpen} className="max-h-full max-w-full rounded-md object-contain shadow-2xl" alt="Preview" />
        </div>
      )}

      {/* IMAGE CROPPER MODAL (Triggered during report) */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-slate-950 p-4">
          <div className="relative h-[350px] w-full max-w-md overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="mt-6 flex w-full max-w-md gap-3">
            <Button variant="outline" className="flex-1 border-slate-700 text-white" onClick={() => setImageToCrop(null)}>Cancel</Button>
            <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={createCroppedImage}>Apply Crop</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Users className="h-8 w-8 text-primary" /> WB Missing Persons
        </h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-rose-600 text-white hover:bg-rose-700">
              <Plus className="h-5 w-5" /> Report Missing
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-slate-900 text-white border-slate-800 sm:max-w-[425px]">
            <DialogHeader><DialogTitle>File New Report</DialogTitle></DialogHeader>
            <div className="mt-2 space-y-4">
              
              {/* Photo Upload Circle */}
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-slate-700 bg-slate-800 hover:bg-slate-750 transition-colors"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  {form.image ? (
                    <img src={form.image} className="h-full w-full object-cover" alt="Selected" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-slate-500">
                      <Camera className="h-8 w-8 mb-1" />
                      <span className="text-[10px] font-medium">Add Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={onFileChange} />
                {form.image && <p className="text-[10px] text-emerald-500 font-medium">Photo Attached</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Full Name <span className="text-rose-500">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Age <span className="text-rose-500">*</span></Label>
                  <Input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">District</Label>
                  <Input value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <Input placeholder="Last Known Location" value={form.lastLocation} onChange={(e) => setForm({...form, lastLocation: e.target.value})} className="bg-slate-800 border-slate-700" />
              
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Contact Phone <span className="text-rose-500">*</span></Label>
                <Input type="tel" value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>

              <Textarea placeholder="Identification Marks" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-slate-800 border-slate-700" />
              <Button className="w-full bg-rose-600 hover:bg-rose-700 mt-2" onClick={reportPerson} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit for Approval"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search name or district..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => {
            const config = statusConfig[p.status] || statusConfig.missing;
            const Icon = config.icon;
            return (
              <Card key={p.id} className={cn("border-l-4 shadow-sm bg-card/40 backdrop-blur-sm", 
                p.status === "missing" ? "border-l-rose-500" : p.status === "found" ? "border-l-emerald-500" : "border-l-amber-500")}>
                <CardContent className="p-5">
                  <div className="mb-4 flex justify-between items-start gap-3">
                    <div className="flex gap-4 items-center">
                      {/* Person Photo Avatar */}
                      <div 
                        className="group relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border border-slate-700 bg-slate-800"
                        onClick={() => p.image && setPreviewOpen(p.image)}
                      >
                        {p.image ? (
                          <>
                            <img src={p.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt={p.name} />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="h-4 w-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-600">
                            <Users className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.age}y • {p.district}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("whitespace-nowrap", config.color)}>
                      <Icon className="mr-1 h-3 w-3" />{config.label}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> Last seen {formatDate(p.lastSeen)}</div>
                    <div className="flex gap-2"><MapPin className="h-3.5 w-3.5 text-primary" /> {p.lastLocation}</div>
                  </div>
                  <p className="mt-3 line-clamp-2 rounded bg-muted/50 p-2 text-sm italic text-slate-300">"{p.description}"</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`tel:${p.contact}`}><Phone className="mr-2 h-4 w-4" /> Contact Family</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}