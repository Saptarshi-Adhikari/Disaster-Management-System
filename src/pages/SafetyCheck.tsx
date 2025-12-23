import { useState } from "react";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  MapPin,
  Clock,
  Send,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  relation: string;
  status: "safe" | "unknown" | "need_help";
  lastUpdate: string;
  location?: string;
}

const contacts: Contact[] = [
  { id: "1", name: "Mom", relation: "Family", status: "safe", lastUpdate: "10 min ago", location: "Home" },
  { id: "2", name: "John Smith", relation: "Neighbor", status: "unknown", lastUpdate: "2 hours ago" },
  { id: "3", name: "Sarah Chen", relation: "Friend", status: "safe", lastUpdate: "30 min ago", location: "Central Shelter" },
  { id: "4", name: "Dad", relation: "Family", status: "need_help", lastUpdate: "1 hour ago", location: "Downtown" },
  { id: "5", name: "Mike Johnson", relation: "Colleague", status: "unknown", lastUpdate: "3 hours ago" },
];

const statusConfig = {
  safe: { label: "Safe", color: "bg-success text-success-foreground", icon: CheckCircle },
  unknown: { label: "Unknown", color: "bg-muted text-muted-foreground", icon: AlertTriangle },
  need_help: { label: "Needs Help", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
};

export default function SafetyCheck() {
  const [myStatus, setMyStatus] = useState<"safe" | "need_help" | null>(null);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleMarkSafe = () => {
    setMyStatus("safe");
    toast({
      title: "Status Updated",
      description: "You've been marked as safe. Your contacts have been notified.",
    });
  };

  const handleNeedHelp = () => {
    setMyStatus("need_help");
    toast({
      title: "Help Request Sent",
      description: "Emergency contacts and nearby responders have been alerted.",
    });
  };

  const handleSendCheckIn = () => {
    toast({
      title: "Check-in Sent",
      description: "Your contacts have been asked to confirm their safety.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Safety Check-In
        </h1>
        <p className="text-muted-foreground mt-1">
          Let loved ones know you're safe or check on their status
        </p>
      </div>

      {/* My Status */}
      <Card variant={myStatus === "safe" ? "safe" : myStatus === "need_help" ? "emergency" : "glass"}>
        <CardHeader>
          <CardTitle>Your Status</CardTitle>
          <CardDescription>Let your emergency contacts know you're okay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {myStatus ? (
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                myStatus === "safe" ? "bg-success/20" : "bg-destructive/20"
              )}>
                {myStatus === "safe" ? (
                  <CheckCircle className="h-8 w-8 text-success" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-xl font-bold">
                  {myStatus === "safe" ? "You're marked as safe" : "Help is on the way"}
                </p>
                <p className="text-muted-foreground">
                  {myStatus === "safe" 
                    ? "Your contacts have been notified" 
                    : "Emergency responders have been alerted"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="safe" size="xl" className="flex-1" onClick={handleMarkSafe}>
                <CheckCircle className="h-6 w-6" />
                I'm Safe
              </Button>
              <Button variant="emergency" size="xl" className="flex-1" onClick={handleNeedHelp}>
                <AlertTriangle className="h-6 w-6" />
                I Need Help
              </Button>
            </div>
          )}
          
          <div>
            <Label htmlFor="message">Add a message (optional)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input 
                id="message"
                placeholder="I'm at the community center..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button variant="default">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="safe">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{contacts.filter(c => c.status === "safe").length}</p>
            <p className="text-sm text-muted-foreground">Confirmed Safe</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{contacts.filter(c => c.status === "unknown").length}</p>
            <p className="text-sm text-muted-foreground">Unknown</p>
          </CardContent>
        </Card>
        <Card variant="emergency">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{contacts.filter(c => c.status === "need_help").length}</p>
            <p className="text-sm text-muted-foreground">Need Help</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Check-In */}
      <Card variant="glass">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Request Check-In</p>
              <p className="text-sm text-muted-foreground">Ask all contacts to confirm their safety</p>
            </div>
          </div>
          <Button variant="default" onClick={handleSendCheckIn}>
            Send Request
          </Button>
        </CardContent>
      </Card>

      {/* Contact List */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Emergency Contacts
        </h2>
        <div className="space-y-3">
          {contacts.map((contact) => {
            const config = statusConfig[contact.status];
            const StatusIcon = config.icon;
            
            return (
              <Card 
                key={contact.id}
                variant={contact.status === "need_help" ? "emergency" : contact.status === "safe" ? "safe" : "glass"}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarFallback className="bg-secondary font-bold">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relation}</p>
                        </div>
                        <Badge className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {contact.lastUpdate}
                        </span>
                        {contact.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {contact.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
