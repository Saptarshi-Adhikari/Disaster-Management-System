import { useState } from "react";
import { 
  Heart, 
  Package, 
  Users, 
  Search, 
  Plus,
  MapPin,
  Clock,
  ArrowRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  type: "offer" | "request";
  category: string;
  title: string;
  description: string;
  quantity: string;
  location: string;
  postedBy: string;
  postedAt: string;
  status: "available" | "pending" | "matched";
  urgent?: boolean;
}

const resources: Resource[] = [
  {
    id: "1",
    type: "offer",
    category: "Water",
    title: "Bottled Water - 50 Cases",
    description: "Clean drinking water, 24 bottles per case. Can deliver within 10 mile radius.",
    quantity: "50 cases",
    location: "Downtown Warehouse",
    postedBy: "Local Grocery Store",
    postedAt: "30 min ago",
    status: "available"
  },
  {
    id: "2",
    type: "request",
    category: "Medical",
    title: "Insulin Needed Urgently",
    description: "Type 1 diabetic needs insulin supply. Current supply running out in 24 hours.",
    quantity: "1 month supply",
    location: "North District",
    postedBy: "Sarah M.",
    postedAt: "1 hour ago",
    status: "pending",
    urgent: true
  },
  {
    id: "3",
    type: "offer",
    category: "Shelter",
    title: "Room Available for Family",
    description: "Spare bedroom available for small family. Pet-friendly. Has WiFi and hot water.",
    quantity: "1 room (up to 4 people)",
    location: "Eastside Suburbs",
    postedBy: "Johnson Family",
    postedAt: "2 hours ago",
    status: "available"
  },
  {
    id: "4",
    type: "request",
    category: "Food",
    title: "Baby Formula Needed",
    description: "Newborn baby needs formula. Any brand accepted. Mother unable to breastfeed.",
    quantity: "Several cans",
    location: "Central Shelter",
    postedBy: "Maria T.",
    postedAt: "45 min ago",
    status: "available",
    urgent: true
  },
  {
    id: "5",
    type: "offer",
    category: "Transportation",
    title: "Vehicle for Medical Transport",
    description: "SUV available for transporting elderly or disabled to medical facilities.",
    quantity: "Available daily 8am-6pm",
    location: "City-wide",
    postedBy: "Community Volunteers",
    postedAt: "3 hours ago",
    status: "available"
  },
  {
    id: "6",
    type: "request",
    category: "Clothing",
    title: "Winter Clothes for Children",
    description: "Family of 3 children (ages 4, 7, 10) needs warm clothing. Lost everything in flood.",
    quantity: "3 sets",
    location: "Riverside Shelter",
    postedBy: "Chen Family",
    postedAt: "5 hours ago",
    status: "matched"
  },
];

const categories = ["All", "Water", "Food", "Medical", "Shelter", "Clothing", "Transportation", "Other"];

export default function Resources() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredResources = resources.filter(resource => {
    const matchesTab = activeTab === "all" || resource.type === activeTab;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleConnect = (resource: Resource) => {
    toast({
      title: "Connection Initiated",
      description: `You've been connected with ${resource.postedBy}. They will contact you shortly.`,
    });
  };

  const handlePost = () => {
    setIsDialogOpen(false);
    toast({
      title: "Posted Successfully",
      description: "Your listing is now visible to others in need.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Resource Matchmaker
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect donors with those in need - every contribution matters
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="safe" size="lg">
              <Plus className="h-5 w-5" />
              Post Offer/Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Post a Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Type</Label>
                <Select defaultValue="offer">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offer">I want to donate/offer</SelectItem>
                    <SelectItem value="request">I need help</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Brief description" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="details">Details</Label>
                <Textarea 
                  id="details" 
                  placeholder="Provide more details about the resource..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Where can this be picked up/delivered?" className="mt-1.5" />
              </div>
              <Button className="w-full" onClick={handlePost}>
                Post Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="safe">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{resources.filter(r => r.type === "offer").length}</p>
            <p className="text-sm text-muted-foreground">Active Offers</p>
          </CardContent>
        </Card>
        <Card variant="warning">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{resources.filter(r => r.type === "request").length}</p>
            <p className="text-sm text-muted-foreground">Active Requests</p>
          </CardContent>
        </Card>
        <Card variant="info">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{resources.filter(r => r.status === "matched").length}</p>
            <p className="text-sm text-muted-foreground">Matched Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="offer">Offers</TabsTrigger>
            <TabsTrigger value="request">Requests</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <ResourceList resources={filteredResources} onConnect={handleConnect} />
        </TabsContent>
        <TabsContent value="offer" className="mt-6">
          <ResourceList resources={filteredResources} onConnect={handleConnect} />
        </TabsContent>
        <TabsContent value="request" className="mt-6">
          <ResourceList resources={filteredResources} onConnect={handleConnect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceList({ resources, onConnect }: { resources: Resource[]; onConnect: (r: Resource) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {resources.map((resource) => (
        <Card 
          key={resource.id}
          variant={resource.urgent ? "warning" : "glass"}
          className="hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={resource.type === "offer" ? "default" : "secondary"}>
                  {resource.type === "offer" ? "Offering" : "Requesting"}
                </Badge>
                <Badge variant="outline">{resource.category}</Badge>
                {resource.urgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              {resource.status === "matched" && (
                <Badge className="bg-success text-success-foreground">
                  <Check className="h-3 w-3 mr-1" />
                  Matched
                </Badge>
              )}
            </div>
            
            <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{resource.quantity}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{resource.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{resource.postedAt} by {resource.postedBy}</span>
              </div>
            </div>
            
            {resource.status !== "matched" && (
              <Button 
                variant={resource.type === "offer" ? "default" : "safe"}
                className="w-full"
                onClick={() => onConnect(resource)}
              >
                {resource.type === "offer" ? "Request This" : "Offer Help"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
