import { useEffect, useState } from "react";
import {
  Heart,
  Search,
  Plus,
  MapPin,
  Phone,
  Check,
  Trash2,
  RotateCcw,
  AlertCircle,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  postedAt: Date;
  status: ResourceStatus;
  urgent?: boolean;
}

const STORAGE_KEY = "wb-resources-data";

const categories = [
  "All",
  "Water",
  "Food",
  "Medical",
  "Shelter",
  "Clothing",
  "Transportation",
  "Other",
];

const initialResources: Resource[] = [
  {
    id: "1",
    type: "offer",
    category: "Water",
    title: "Bottled Water - 50 Cases",
    description: "Clean drinking water. Delivery available.",
    quantity: "50 cases",
    location: "Salt Lake City",
    postedBy: "Local Grocery Store",
    contact: "7029786817",
    postedAt: new Date(Date.now() - 30 * 60000),
    status: "available",
  },
  {
    id: "2",
    type: "request",
    category: "Medical",
    title: "Insulin Needed Urgently",
    description: "Supply running out in 24 hours.",
    quantity: "1 month",
    location: "North District",
    postedBy: "Sarah M.",
    contact: "7029786817",
    postedAt: new Date(Date.now() - 60 * 60000),
    status: "pending",
    urgent: true,
  },
  {
    id: "3",
    type: "offer",
    category: "Medical",
    title: "Available: Insulin Supply",
    description: "Refrigerated and sealed vials.",
    quantity: "1 month",
    location: "Purulia Zilla Parishad",
    postedBy: "Sarah M.",
    contact: "7029786817",
    postedAt: new Date(Date.now() - 60 * 60000),
    status: "available",
  },
];

export default function Resources() {
  const { toast } = useToast();

  const [tab, setTab] = useState<"all" | ResourceType>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<Resource | null>(null);

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialResources;
    try {
      return JSON.parse(saved).map((r: any) => ({
        ...r,
        postedAt: new Date(r.postedAt),
      }));
    } catch {
      return initialResources;
    }
  });

  const [form, setForm] = useState({
    type: "offer",
    category: "",
    title: "",
    description: "",
    location: "",
    quantity: "",
    contact: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  const postResource = () => {
    if (!form.title || !form.category || !form.contact) {
      toast({
        title: "Missing Fields",
        description: "Title, category and contact are required.",
        variant: "destructive",
      });
      return;
    }

    setResources((r) => [
      {
        id: Date.now().toString(),
        postedBy: "Community Member",
        postedAt: new Date(),
        status: "available",
        quantity: form.quantity || "Not specified",
        ...form,
      } as Resource,
      ...r,
    ]);

    setForm({
      type: "offer",
      category: "",
      title: "",
      description: "",
      location: "",
      quantity: "",
      contact: "",
    });
    setOpen(false);
    toast({ title: "Posted Successfully" });
  };

  const updateStatus = (id: string, status: ResourceStatus) =>
    setResources((r) =>
      r.map((x) => (x.id === id ? { ...x, status } : x))
    );

  const deleteResource = (id: string) =>
    setResources((r) => r.filter((x) => x.id !== id));

  const filtered = resources.filter((r) => {
    const tabOk = tab === "all" || r.type === tab;
    const searchOk =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const categoryOk = category === "All" || r.category === category;
    return tabOk && searchOk && categoryOk;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="h-8 w-8 text-primary" />
            Resource Matchmaker
          </h1>
          <p className="mt-1 text-muted-foreground">
            Connect donors with those in need
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-emerald-600 text-white">
              <Plus className="h-5 w-5" />
              Post Offer/Request
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post a Resource</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Select
                onValueChange={(v) =>
                  setForm({ ...form, type: v as ResourceType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">I want to donate</SelectItem>
                  <SelectItem value="request">I need help</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {["title", "location", "quantity", "contact"].map((f) => (
                <Input
                  key={f}
                  placeholder={f[0].toUpperCase() + f.slice(1)}
                  value={(form as any)[f]}
                  onChange={(e) =>
                    setForm({ ...form, [f]: e.target.value })
                  }
                />
              ))}

              <Textarea
                placeholder="Details"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <Button className="w-full bg-emerald-600" onClick={postResource}>
                Post Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" onValueChange={(v) => setTab(v as any)}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="offer">Offers</TabsTrigger>
            <TabsTrigger value="request">Requests</TabsTrigger>
          </TabsList>

          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className={cn(
                "border-l-4 shadow-sm",
                r.urgent
                  ? "border-l-rose-500 bg-rose-500/5"
                  : "border-l-primary"
              )}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex justify-between">
                  <div className="flex gap-2">
                    <Badge>{r.type}</Badge>
                    <Badge variant="outline">{r.category}</Badge>
                  </div>
                  {r.status === "matched" && (
                    <Badge className="bg-emerald-500">
                      <Check className="mr-1 h-3 w-3" />
                      Matched
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold">{r.title}</h3>
                <p className="my-3 text-sm text-muted-foreground line-clamp-2">
                  {r.description}
                </p>

                <div className="mb-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {r.location}
                  </div>
                  <div className="flex gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {r.contact}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`tel:${r.contact}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </a>
                  </Button>

                  {r.status === "matched" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-600"
                      onClick={() => setResetTarget(r)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(r.id, "matched")}
                    >
                      Mark Matched
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteResource(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>

      {/* Reset Confirmation */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => !o && setResetTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Reset Status?</DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Reset <strong>{resetTarget?.title}</strong> back to active?
          </p>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600"
              onClick={() => {
                if (!resetTarget) return;
                updateStatus(
                  resetTarget.id,
                  resetTarget.type === "offer"
                    ? "available"
                    : "pending"
                );
                setResetTarget(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
