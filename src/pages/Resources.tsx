import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  deleteDoc 
} from "firebase/firestore";
import {
  Heart,
  Search,
  Plus,
  MapPin,
  Phone,
  Check,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Added for better form labeling
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ResourceType = "offer" | "request";
type ResourceStatus = "available" | "pending" | "matched";

interface Resource {
  id: string;
  type: ResourceType;
  category: string;
  title: string;
  description: string;
  quantity: string;
  location: string;
  postedBy: string;
  contact: string;
  postedAt: any;
  status: ResourceStatus;
  urgent?: boolean;
}

const categories = ["All", "Water", "Food", "Medical", "Shelter", "Clothing", "Transportation", "Other"];
const ADMIN_PHONE = "+917029786817";

export default function Resources() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"all" | ResourceType>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    type: "offer" as ResourceType,
    category: "",
    title: "",
    description: "",
    location: "",
    quantity: "",
    contact: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "resources"),
      where("status_approval", "==", "approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
      setResources(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const postResource = async () => {
    // MANDATORY FIELD CHECK
    if (!form.contact.trim()) {
      toast({ 
        title: "Phone Number Required", 
        description: "Please provide a contact number so people can reach you.",
        variant: "destructive" 
      });
      return;
    }

    if (!form.title || !form.category) {
      toast({ title: "Missing Fields", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, "resources"), {
        ...form,
        postedBy: "Community Member",
        postedAt: Timestamp.now(),
        status: "available",
        status_approval: "pending",
        quantity: form.quantity || "0",
      });

      setForm({ type: "offer", category: "", title: "", description: "", location: "", quantity: "", contact: "" });
      setOpen(false);
      toast({ title: "Submitted", description: "Listing will appear after admin verification." });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const updateStatus = async (id: string, status: ResourceStatus) => {
    try {
      await updateDoc(doc(db, "resources", id), { status });
      toast({ title: "Status Updated" });
    } catch (e) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const deleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
      toast({ title: "Listing Deleted" });
    } catch (e) {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  const filtered = resources.filter((r) => {
    const tabOk = tab === "all" || r.type === tab;
    const searchOk = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const categoryOk = category === "All" || r.category === category;
    return tabOk && searchOk && categoryOk;
  });

  const isAdmin = currentUser?.phoneNumber === ADMIN_PHONE;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="h-8 w-8 text-primary" />
            Resource Matchmaker
          </h1>
          <p className="mt-1 text-muted-foreground">Connect donors with those in need</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="h-5 w-5" />
              Post Offer/Request
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-slate-900 text-white border-slate-800">
            <DialogHeader><DialogTitle>Post a Resource</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Select onValueChange={(v) => setForm({ ...form, type: v as ResourceType })}>
                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent><SelectItem value="offer">I want to donate</SelectItem><SelectItem value="request">I need help</SelectItem></SelectContent>
              </Select>
              
              <Select onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>

              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-slate-800 border-slate-700" />
              
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="bg-slate-800 border-slate-700" />
                <Input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>

              {/* MANDATORY PHONE FIELD */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Contact Phone <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. +91XXXXXXXXXX" 
                  type="tel" 
                  value={form.contact} 
                  onChange={(e) => setForm({...form, contact: e.target.value})} 
                  className="bg-slate-800 border-slate-700 ring-offset-slate-900 focus-visible:ring-emerald-500" 
                />
              </div>

              <Textarea placeholder="Details" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-slate-800 border-slate-700" />
              
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={postResource}>Submit Listing</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setTab(v as any)}>
        {/* ... Tab structure remains the same ... */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="offer">Offers</TabsTrigger><TabsTrigger value="request">Requests</TabsTrigger></TabsList>
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-emerald-500" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((r) => (
              <Card key={r.id} className={cn("border-l-4 shadow-sm bg-card/40 backdrop-blur-sm", r.urgent ? "border-l-rose-500" : "border-l-emerald-500")}>
                <CardContent className="p-5">
                  <div className="mb-3 flex justify-between">
                    <div className="flex gap-2">
                      <Badge className="capitalize">{r.type}</Badge>
                      <Badge variant="outline">{r.category}</Badge>
                    </div>
                    {r.status === "matched" && <Badge className="bg-emerald-500"><Check className="mr-1 h-3 w-3" />Matched</Badge>}
                  </div>
                  <h3 className="text-lg font-bold">{r.title}</h3>
                  <p className="my-3 text-sm text-muted-foreground line-clamp-2 italic">"{r.description}"</p>
                  
                  <div className="mb-4 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{r.location}</div>
                    <div className="flex gap-2 font-medium"><Badge variant="secondary" className="text-[10px] h-5">Qty: {r.quantity}</Badge></div>
                    <div className="flex gap-2"><Phone className="h-3.5 w-3.5 text-primary" />{r.contact}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`tel:${r.contact}`}><Phone className="mr-2 h-4 w-4" />Call</a>
                    </Button>
                    
                    {/* ADMIN-ONLY MARK MATCHED BUTTON */}
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, r.status === "matched" ? "available" : "matched")}>
                        {r.status === "matched" ? <RotateCcw className="h-4 w-4" /> : "Mark Matched"}
                      </Button>
                    )}
                    
                    {/* ADMIN-ONLY DELETE BUTTON */}
                    {isAdmin && (
                      <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => deleteResource(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
}