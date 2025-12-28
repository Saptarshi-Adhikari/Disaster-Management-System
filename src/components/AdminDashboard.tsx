import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  ShieldCheck, 
  Check, 
  Trash2, 
  Loader2,
  MapPin,
  Users as UsersIcon,
  TrendingUp,
  Search,
  Download // New Icon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [shelters, setShelters] = useState<any[]>([]);
  const [missingPersons, setMissingPersons] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [activeTab, setActiveTab] = useState("missing"); // Track active tab

  useEffect(() => {
    const unsubShelters = onSnapshot(collection(db, "shelters"), (s) => 
      setShelters(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const unsubMissing = onSnapshot(collection(db, "missing_persons"), (s) => 
      setMissingPersons(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const unsubResources = onSnapshot(collection(db, "resources"), (s) => 
      setResources(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    setLoading(false);
    return () => { unsubShelters(); unsubMissing(); unsubResources(); };
  }, []);

  // --- NEW: Export CSV Logic ---
  const exportToCSV = () => {
    let dataToExport: any[] = [];
    let filename = "export.csv";

    if (activeTab === "missing") {
      dataToExport = missingPersons;
      filename = "missing_persons_report.csv";
    } else if (activeTab === "resources") {
      dataToExport = resources;
      filename = "resources_report.csv";
    } else {
      dataToExport = shelters;
      filename = "shelters_report.csv";
    }

    if (dataToExport.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = Object.keys(dataToExport[0]).filter(k => k !== 'coords').join(",");
    const rows = dataToExport.map(item => {
      return Object.entries(item)
        .filter(([key]) => key !== 'coords')
        .map(([, value]) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Started", description: `Downloading ${filename}` });
  };

  const filterData = (data: any[]) => {
    return data.filter(item => 
      (item.name || item.title || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (item.district || item.location || item.address || "").toLowerCase().includes(adminSearch.toLowerCase())
    );
  };

  const approve = async (col: string, id: string) => {
    try {
      await updateDoc(doc(db, col, id), { status_approval: "approved" });
      toast({ title: "Approved Successfully" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const removeItem = async (col: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteDoc(doc(db, col, id));
      toast({ title: "Deleted Permanently" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const updateOccupancy = async (id: string, current: number, capacity: number) => {
    const occupancyPercent = (current / capacity) * 100;
    let newStatus = "open";
    if (occupancyPercent > 90) newStatus = "full";
    else if (occupancyPercent > 70) newStatus = "limited";

    try {
      await updateDoc(doc(db, "shelters", id), { current, status: newStatus });
      toast({ title: "Occupancy Updated" });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 pb-10 container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Command Center</h1>
            <p className="text-slate-400">Verify reports and manage disaster response</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search Records..." 
              className="pl-10 bg-slate-900 border-slate-700 text-white"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
            />
          </div>
          {/* NEW: Export Button */}
          <Button variant="outline" size="icon" onClick={exportToCSV} className="border-slate-700 hover:bg-slate-800">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="missing" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px] bg-slate-900 border border-slate-800 mb-6">
          <TabsTrigger value="missing">Missing ({missingPersons.filter(p => p.status_approval === 'pending').length})</TabsTrigger>
          <TabsTrigger value="resources">Resources ({resources.filter(r => r.status_approval === 'pending').length})</TabsTrigger>
          <TabsTrigger value="shelters">Shelters</TabsTrigger>
        </TabsList>

        <TabsContent value="missing" className="space-y-4">
          {filterData(missingPersons).map((p) => (
            <AdminCard 
              key={p.id} 
              item={p} 
              onApprove={() => approve("missing_persons", p.id)} 
              onDelete={() => removeItem("missing_persons", p.id)} 
            />
          ))}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {filterData(resources).map((r) => (
            <AdminCard 
              key={r.id} 
              item={r} 
              onApprove={() => approve("resources", r.id)} 
              onDelete={() => removeItem("resources", r.id)} 
            />
          ))}
        </TabsContent>

        <TabsContent value="shelters" className="space-y-4">
          {filterData(shelters).map((s) => (
            <AdminCard 
              key={s.id} 
              item={s} 
              onApprove={() => approve("shelters", s.id)} 
              onDelete={() => removeItem("shelters", s.id)}
              isShelter={true}
              onUpdateOccupancy={(val: number) => updateOccupancy(s.id, val, s.capacity)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ... AdminCard and cn function remain exactly the same as previous response
function AdminCard({ item, onApprove, onDelete, isShelter, onUpdateOccupancy }: any) {
  const isPending = item.status_approval === "pending";

  return (
    <Card className={cn(
      "overflow-hidden border-slate-800 bg-slate-900/50 transition-all mb-4", 
      isPending ? "border-amber-500/40 bg-amber-500/5" : ""
    )}>
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-white">{item.name || item.title}</h3>
            {isPending && <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">PENDING</Badge>}
            {!isPending && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">LIVE</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.district || item.location || item.address}</span>
            <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" /> {item.contact || item.phone || "No Contact"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {!isPending && isShelter && (
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
              <TrendingUp className="h-4 w-4 text-primary ml-1" />
              <Input 
                type="number"
                defaultValue={item.current}
                onBlur={(e) => onUpdateOccupancy(Number(e.target.value))}
                className="w-20 h-8 bg-transparent border-none focus-visible:ring-0 text-white text-center"
              />
              <span className="text-slate-500 text-sm mr-2">/ {item.capacity}</span>
            </div>
          )}

          <div className="flex gap-2">
            {isPending && (
              <Button size="sm" onClick={onApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={onDelete} className="bg-rose-600 hover:bg-rose-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}