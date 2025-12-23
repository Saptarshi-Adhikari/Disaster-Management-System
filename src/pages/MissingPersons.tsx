import { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Clock, 
  MapPin, 
  Phone,
  Eye,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Person {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastSeen: string;
  lastLocation: string;
  description: string;
  status: "missing" | "found" | "searching";
  reportedAt: string;
  contact: string;
}

const missingPersons: Person[] = [
  {
    id: "1",
    name: "Maria Santos",
    age: 45,
    gender: "Female",
    lastSeen: "2 hours ago",
    lastLocation: "Downtown Shopping Center",
    description: "5'4\", brown hair, wearing blue jacket and jeans",
    status: "missing",
    reportedAt: "1 hour ago",
    contact: "(555) 111-2222"
  },
  {
    id: "2",
    name: "James Wilson",
    age: 72,
    gender: "Male",
    lastSeen: "5 hours ago",
    lastLocation: "Riverside Park",
    description: "6'0\", gray hair, uses walking cane, red sweater",
    status: "searching",
    reportedAt: "3 hours ago",
    contact: "(555) 333-4444"
  },
  {
    id: "3",
    name: "Emily Chen",
    age: 8,
    gender: "Female",
    lastSeen: "1 hour ago",
    lastLocation: "Central Elementary School",
    description: "4'2\", black hair in pigtails, pink backpack",
    status: "found",
    reportedAt: "45 minutes ago",
    contact: "(555) 555-6666"
  },
  {
    id: "4",
    name: "Robert Thompson",
    age: 35,
    gender: "Male",
    lastSeen: "8 hours ago",
    lastLocation: "Highway 101 Rest Area",
    description: "5'10\", bald, tattoo on left arm, driving white sedan",
    status: "missing",
    reportedAt: "6 hours ago",
    contact: "(555) 777-8888"
  },
];

const statusConfig = {
  missing: { label: "Missing", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  searching: { label: "Active Search", color: "bg-warning text-warning-foreground", icon: Search },
  found: { label: "Found Safe", color: "bg-success text-success-foreground", icon: CheckCircle },
};

export default function MissingPersons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { toast } = useToast();

  const filteredPersons = missingPersons.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.lastLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReport = () => {
    setIsReportOpen(false);
    toast({
      title: "Report Submitted",
      description: "Your missing person report has been submitted to authorities.",
    });
  };

  const handleSighting = (name: string) => {
    toast({
      title: "Sighting Reported",
      description: `Thank you for reporting a sighting of ${name}. Authorities have been notified.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Missing Persons Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Help reunite families - report sightings or missing persons
          </p>
        </div>
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogTrigger asChild>
            <Button variant="emergency" size="lg">
              <Plus className="h-5 w-5" />
              Report Missing Person
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Report Missing Person</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter name" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Age" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="lastSeen">Last Seen Location</Label>
                <Input id="lastSeen" placeholder="Where were they last seen?" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="description">Physical Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Height, clothing, distinguishing features..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact">Your Contact Number</Label>
                <Input id="contact" type="tel" placeholder="+1 (555) 000-0000" className="mt-1.5" />
              </div>
              <Button className="w-full" onClick={handleReport}>
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="emergency">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{missingPersons.filter(p => p.status === "missing").length}</p>
            <p className="text-sm text-muted-foreground">Currently Missing</p>
          </CardContent>
        </Card>
        <Card variant="warning">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{missingPersons.filter(p => p.status === "searching").length}</p>
            <p className="text-sm text-muted-foreground">Active Searches</p>
          </CardContent>
        </Card>
        <Card variant="safe">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{missingPersons.filter(p => p.status === "found").length}</p>
            <p className="text-sm text-muted-foreground">Found Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or last known location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Person Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPersons.map((person) => {
          const config = statusConfig[person.status];
          const StatusIcon = config.icon;
          
          return (
            <Card 
              key={person.id}
              variant={person.status === "missing" ? "emergency" : person.status === "found" ? "safe" : "warning"}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarFallback className="text-xl font-bold bg-secondary">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {person.age} years old • {person.gender}
                        </p>
                      </div>
                      <Badge className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>Last seen {person.lastSeen}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{person.lastLocation}</span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {person.description}
                    </p>
                    
                    <div className="flex gap-2 mt-4">
                      {person.status !== "found" && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSighting(person.name)}
                        >
                          <Eye className="h-4 w-4" />
                          Report Sighting
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
