import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Search,
  Plus,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface Person {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastSeen: Date;
  lastLocation: string;
  district: string;
  description: string;
  status: Status;
  reportedAt: Date;
  contact: string;
}

const STORAGE_KEY = "wb-missing-persons-data";

const initialMissingPersons: Person[] = [
  {
    id: "1",
    name: "Anirban Chatterjee",
    age: 34,
    gender: "Male",
    lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lastLocation: "Sealdah Station, Platform 9",
    district: "Kolkata",
    description: `5'8", wheatish complexion, wearing a white kurta.`,
    status: "missing",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    contact: "03322145566",
  },
  {
    id: "2",
    name: "Sumitra Devi",
    age: 68,
    gender: "Female",
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastLocation: "Mall Road, Near Clock Tower",
    district: "Darjeeling",
    description: `5'2", gray hair bun, wearing a red shawl.`,
    status: "searching",
    reportedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    contact: "03542251122",
  },
];

const statusConfig: Record<
  Status,
  { label: string; color: string; icon: any }
> = {
  missing: {
    label: "Missing",
    color: "bg-rose-500/10 text-rose-600 border-rose-200",
    icon: AlertTriangle,
  },
  searching: {
    label: "Active Search",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: Search,
  },
  found: {
    label: "Found Safe",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    icon: CheckCircle,
  },
};

export default function MissingPersons() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [persons, setPersons] = useState<Person[]>(() => {
    if (typeof window === "undefined") return initialMissingPersons;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialMissingPersons;

    try {
      return JSON.parse(saved).map((p: any) => ({
        ...p,
        lastSeen: new Date(p.lastSeen),
        reportedAt: new Date(p.reportedAt),
      }));
    } catch {
      return initialMissingPersons;
    }
  });

  const [form, setForm] = useState({
    name: "",
    age: "",
    district: "",
    lastLocation: "",
    description: "",
    contact: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persons));
  }, [persons]);

  const reportPerson = () => {
    if (!form.name || !form.contact || !form.age) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in all required fields.",
        variant: "destructive" 
      });
      return;
    }

    setPersons((p) => [
      {
        id: Date.now().toString(),
        name: form.name,
        age: Number(form.age),
        gender: "Not Specified",
        lastSeen: new Date(),
        lastLocation: form.lastLocation,
        district: form.district,
        description: form.description,
        status: "missing",
        reportedAt: new Date(),
        contact: form.contact,
      },
      ...p,
    ]);

    setForm({
      name: "",
      age: "",
      district: "",
      lastLocation: "",
      description: "",
      contact: "",
    });
    setOpen(false);
    toast({ title: "Report Saved Locally" });
  };

  const updateStatus = (id: string, status: Status) =>
    setPersons((p) =>
      p.map((x) => (x.id === id ? { ...x, status } : x))
    );

  const deletePerson = (id: string) => {
    setPersons((p) => p.filter((x) => x.id !== id));
    toast({ title: "Entry Deleted", variant: "destructive" });
  };

  const filtered = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-8 w-8 text-primary" />
          WB Missing Persons
        </h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-rose-600 text-white hover:bg-rose-700">
              <Plus className="h-5 w-5" />
              Report Missing
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>File New Report</DialogTitle>
            </DialogHeader>

            <div className="mt-2 space-y-3">
              {[
                ["Full Name", "name"],
                ["Age", "age"],
                ["District", "district"],
                ["Last Location", "lastLocation"],
                ["Your Phone Number", "contact"],
              ].map(([label, key]) => (
                <Input
                  key={key}
                  placeholder={label}
                  type={key === "age" ? "number" : key === "contact" ? "tel" : "text"}
                  min={key === "age" ? "1" : undefined}
                  value={(form as any)[key]}
                  onChange={(e) => {
                    const val = e.target.value;

                    // AGE: Only positive numbers
                    if (key === "age") {
                      if (val !== "" && (!/^\d+$/.test(val) || parseInt(val) <= 0)) return;
                    }

                    // CONTACT: Only digits, max 12 (to allow for country code if needed)
                    if (key === "contact") {
                      if (val !== "" && !/^\d+$/.test(val)) return;
                      if (val.length > 12) return;
                    }

                    setForm((prev) => ({ ...prev, [key]: val }));
                  }}
                />
              ))}

              <Textarea
                placeholder="Identification Marks"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />

              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={reportPerson}>
                Save Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search name or district..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((p) => {
          const { icon: Icon, label, color } = statusConfig[p.status];

          return (
            <Card
              key={p.id}
              className={cn(
                "border-l-4 shadow-sm",
                p.status === "missing"
                  ? "border-l-rose-500"
                  : p.status === "found"
                  ? "border-l-emerald-500"
                  : "border-l-amber-500"
              )}
            >
              <CardContent className="p-5">
                <div className="mb-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.age}y • {p.district}
                    </p>
                  </div>

                  <Badge variant="outline" className={color}>
                    <Icon className="mr-1 h-3 w-3" />
                    {label}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Last seen{" "}
                    {formatDistanceToNow(p.lastSeen, { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {p.lastLocation}
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 rounded bg-muted p-2 text-sm italic">
                  "{p.description}"
                </p>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`tel:${p.contact}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Contact
                    </a>
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deletePerson(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {(["missing", "searching", "found"] as Status[]).map(
                    (s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={p.status === s ? "default" : "outline"}
                        className="flex-1 text-[10px] capitalize"
                        onClick={() => updateStatus(p.id, s)}
                      >
                        {s}
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}