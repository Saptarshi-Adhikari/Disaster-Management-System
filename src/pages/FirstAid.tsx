import { useState } from "react";
import { 
  FileText, Search, Heart, Droplets, Flame, Wind,
  AlertTriangle, ChevronRight, Clock, CheckCircle,
  BotMessageSquare, Send, Loader2, X, User,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAIEmergencyResponse } from "@/lib/gemini"; // Import the AI service

// --- INTERFACES ---
interface FirstAidGuide {
  id: string;
  category: string;
  icon: any;
  title: string;
  subtitle: string;
  duration: string;
  steps: {
    step: number;
    title: string;
    description: string;
    warning?: string;
  }[];
}

// --- DATA ---
const guides: FirstAidGuide[] = [
  {
    id: "cpr",
    category: "Emergency",
    icon: Heart,
    title: "CPR (Cardiopulmonary Resuscitation)",
    subtitle: "For unresponsive person not breathing normally",
    duration: "Until help arrives",
    steps: [
      { step: 1, title: "Check for Response", description: "Tap the person's shoulders firmly and shout 'Are you okay?' Check for normal breathing for no more than 10 seconds." },
      { step: 2, title: "Call for Help", description: "If no response, call 100 immediately or have someone else call. Put the phone on speaker so you can follow instructions." },
      { step: 3, title: "Begin Chest Compressions", description: "Place the heel of your hand on the center of the chest. Push hard and fast at least 2 inches deep at a rate of 100-120 compressions per minute.", warning: "Don't stop compressions unless absolutely necessary" },
      { step: 4, title: "Give Rescue Breaths (if trained)", description: "After 30 compressions, tilt the head back, lift the chin, and give 2 rescue breaths. Each breath should take about 1 second and make the chest rise." },
      { step: 5, title: "Continue CPR", description: "Repeat cycles of 30 compressions and 2 breaths until emergency services arrive or the person starts breathing normally." }
    ]
  },
  {
    id: "bleeding",
    category: "Trauma",
    icon: Droplets,
    title: "Severe Bleeding Control",
    subtitle: "For wounds with heavy blood loss",
    duration: "5-10 minutes",
    steps: [
      { step: 1, title: "Apply Direct Pressure", description: "Use a clean cloth, bandage, or even clothing to apply firm, steady pressure directly on the wound." },
      { step: 2, title: "Elevate the Injured Area", description: "If possible, raise the bleeding body part above the level of the heart to help slow blood flow." },
      { step: 3, title: "Add More Material if Needed", description: "If blood soaks through, add more cloth on top. Do not remove the original material.", warning: "Never remove blood-soaked bandages" },
      { step: 4, title: "Apply Tourniquet if Necessary", description: "For life-threatening limb bleeding, apply a tourniquet 2-3 inches above the wound. Note the time applied." },
      { step: 5, title: "Keep Victim Warm", description: "Cover the person with a blanket to prevent shock. Keep them calm and still until help arrives." }
    ]
  },
  {
    id: "burns",
    category: "Trauma",
    icon: Flame,
    title: "Burn Treatment",
    subtitle: "For thermal, chemical, or electrical burns",
    duration: "10-20 minutes",
    steps: [
      { step: 1, title: "Stop the Burning Process", description: "Remove the person from the source of the burn. Remove any clothing or jewelry near the burn that isn't stuck to the skin." },
      { step: 2, title: "Cool the Burn", description: "Hold the burned area under cool (not cold) running water for at least 10-20 minutes.", warning: "Never use ice, butter, or toothpaste on burns" },
      { step: 3, title: "Cover with Clean Material", description: "After cooling, cover the burn loosely with a sterile, non-stick bandage or clean cloth." },
      { step: 4, title: "Manage Pain", description: "Over-the-counter pain relievers like ibuprofen can help. Keep the person hydrated." },
      { step: 5, title: "Seek Medical Help", description: "Seek immediate medical attention for burns larger than your palm, or if the burn appears white or charred." }
    ]
  },
  {
    id: "choking",
    category: "Emergency",
    icon: Wind,
    title: "Choking (Heimlich Maneuver)",
    subtitle: "For adults and children over 1 year",
    duration: "Until object is expelled",
    steps: [
      { step: 1, title: "Confirm Choking", description: "Ask 'Are you choking?' If the person can't speak, cough, or breathe, they need immediate help." },
      { step: 2, title: "Position Yourself", description: "Stand behind the person and wrap your arms around their waist. Lean them slightly forward." },
      { step: 3, title: "Make a Fist", description: "Place your fist just above the person's navel (belly button) with your thumb against their stomach." },
      { step: 4, title: "Perform Abdominal Thrusts", description: "Grasp your fist with your other hand and thrust inward and upward in a quick, forceful motion.", warning: "For pregnant women or obese individuals, perform chest thrusts instead" },
      { step: 5, title: "Repeat Until Successful", description: "Continue thrusts until the object is expelled. If they become unconscious, begin CPR." }
    ]
  }
];

const quickTips = [
  { icon: AlertTriangle, text: "Stay calm - panicking makes everything harder" },
  { icon: CheckCircle, text: "Call 100 first if the situation is life-threatening" },
  { icon: Clock, text: "Every second counts in emergencies" },
];

export default function FirstAid() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide | null>(null);

  // --- AI STATE ---
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAsk = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    setIsAiLoading(true);
    // Don't clear previous response immediately to avoid layout jump
    try {
      const response = await getAIEmergencyResponse(aiInput, guides);
      setAiResponse(response);
    } catch (error) {
      setAiResponse("I'm having trouble connecting to the AI. Please follow the manual guides below or call 100/101.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          First Aid Guide
        </h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step life-saving procedures - verified information
        </p>
      </div>

      {/* --- AI EMERGENCY ASSISTANT --- */}
      <Card variant="glass" className="border-primary/30 bg-primary/5 slide-up">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5 text-primary" />
            AI Emergency Assistant
          </CardTitle>
          <CardDescription>Ask "How to treat heavy bleeding?" or "Steps for CPR"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Describe the emergency situation..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              className="bg-background/50 border-primary/20"
            />
            <Button onClick={handleAiAsk} disabled={isAiLoading || !aiInput.trim()}>
              {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {aiResponse && (
            <div className="p-4 rounded-lg bg-background/80 border border-primary/20 animate-in fade-in slide-in-from-top-2 relative">
              <button 
                onClick={() => setAiResponse(null)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-xs text-primary font-bold mb-1 uppercase tracking-wider">
                <BotMessageSquare className="h-3 w-3" />
                AI Guidance
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{aiResponse}</p>
              <div className="mt-3 pt-2 border-t border-primary/10 flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground italic">Always prioritize calling emergency services (100) in life-threatening situations.</p>
                <Button variant="ghost" size="sm" onClick={() => setAiResponse(null)} className="h-6 text-[10px] gap-1">
                  <RefreshCcw className="h-3 w-3" /> Reset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Badge */}
      <Card variant="safe" className="border-success/30">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium">Available Offline</p>
            <p className="text-sm text-muted-foreground">Manual guides are cached for zero-internet situations</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="grid gap-3 sm:grid-cols-3">
        {quickTips.map((tip, index) => (
          <Card key={index} variant="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <tip.icon className="h-5 w-5 text-warning shrink-0" />
              <p className="text-sm">{tip.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search manual first aid procedures..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Guide Selection or Detail View */}
      {selectedGuide ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <Button variant="ghost" onClick={() => setSelectedGuide(null)} className="gap-2">
            ← Back to all guides
          </Button>
          
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <selectedGuide.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">{selectedGuide.category}</Badge>
                  <CardTitle className="text-2xl">{selectedGuide.title}</CardTitle>
                  <CardDescription className="mt-1">{selectedGuide.subtitle}</CardDescription>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {selectedGuide.duration}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedGuide.steps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{step.title}</h4>
                      <p className="text-muted-foreground mt-1">{step.description}</p>
                      {step.warning && (
                        <div className="mt-2 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                          <p className="text-sm text-warning">{step.warning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGuides.map((guide) => (
            <Card 
              key={guide.id}
              variant="interactive"
              onClick={() => setSelectedGuide(guide)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="mb-2">{guide.category}</Badge>
                    <h3 className="font-bold text-lg">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{guide.subtitle}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{guide.duration}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Steps
                        <ChevronRight className="h-4 w-4" />
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
  );
}