import { useState, useEffect } from "react";
import { 
  Shield, CheckCircle, AlertTriangle, MapPin,
  Clock, Send, Heart, Trash2, PlusCircle, UserPlus, Phone, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function SafetyCheck() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [myStatus, setMyStatus] = useState<"safe" | "need_help" | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("emergency_contacts");
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("emergency_contacts", JSON.stringify(contacts));
  }, [contacts]);

  const addContact = () => {
    if (!newName || newPhone.length !== 10) {
      toast({ title: "Error", description: "Please enter a valid name and 10-digit phone.", variant: "destructive" });
      return;
    }
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      relation: newRelation || "Contact"
    };
    setContacts([...contacts, contact]);
    setNewName(""); setNewPhone(""); setNewRelation("");
    toast({ title: "Contact Added", description: `${newName} has been added.` });
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast({ title: "Removed", description: "Contact deleted." });
  };

  const handleNeedHelp = () => {
    if (contacts.length === 0) {
      toast({ title: "No Contacts", description: "Add emergency contacts first!", variant: "destructive" });
      return;
    }

    setMyStatus("need_help");

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      const contactNames = contacts.map(c => c.name).join(", ");
      const sosMessage = `🚨 EMERGENCY SOS! 🚨\nI need help. My location: ${mapsUrl}`;
      
      window.open(`https://wa.me/?text=${encodeURIComponent(sosMessage)}`, '_blank');

      const phoneNumbers = contacts.map(c => c.phone).join(",");
      setTimeout(() => {
        window.open(`sms:${phoneNumbers}?body=${encodeURIComponent(sosMessage)}`, '_blank');
      }, 1000);
      
      toast({
        title: "SOS Triggered",
        description: `Alerting ${contacts.length} people via WhatsApp & SMS.`,
        variant: "destructive",
      });
    }, () => {
      window.open(`https://wa.me/?text=${encodeURIComponent("EMERGENCY SOS! I need help but GPS is blocked.")}`, '_blank');
    }, { enableHighAccuracy: true, timeout: 5000 });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Shield className="h-10 w-10 text-rose-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SOS Safety Center</h1>
          <p className="text-sm text-muted-foreground">Emergency contacts & broadcast system</p>
        </div>
      </div>

      {/* Main Action Card */}
      <Card className={cn(
        "border-2",
        myStatus === "need_help" ? "border-rose-600 bg-rose-50/10" : "border-primary/20"
      )}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-20 text-lg border-emerald-500 text-emerald-600 hover:bg-emerald-50/30"
              onClick={() => { setMyStatus("safe"); toast({ title: "Safe", description: "Status updated to Safe." }); }}
            >
              <CheckCircle className="mr-2 h-6 w-6" /> I'm Safe
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-20 text-lg font-bold"
              onClick={handleNeedHelp}
            >
              <AlertTriangle className="mr-2 h-6 w-6" /> I NEED HELP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Contact Feature */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Add Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">+91</span>
                <Input className="pl-10" placeholder="10 digits" value={newPhone} onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0,10))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Relation</Label>
              <Input placeholder="Relation" value={newRelation} onChange={e => setNewRelation(e.target.value)} />
            </div>
          </div>
          <Button className="w-full" onClick={addContact}>
            <PlusCircle className="mr-2 h-4 w-4" /> Save Contact
          </Button>
        </CardContent>
      </Card>

      {/* Dynamic Contact List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
          Emergency Contacts ({contacts.length})
        </h2>
        
        {contacts.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed rounded-lg text-muted-foreground text-sm italic">
            No contacts added yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="border-l-4 border-l-rose-500">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-slate-50 text-slate-600 font-bold">
                      {contact.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{contact.name}</h4>
                        <p className="text-[10px] uppercase text-muted-foreground">{contact.relation} • {contact.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => window.open(`tel:${contact.phone}`)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-rose-500 hover:bg-rose-50"
                          onClick={() => deleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}