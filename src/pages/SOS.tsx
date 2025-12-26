/**
 * ========================================
 * SOS.tsx - EMERGENCY SOS PAGE
 * ========================================
 * 
 * This page allows users to send an emergency distress signal.
 * 
 * FEATURES:
 * 1. Select emergency type (flood, fire, earthquake, etc.)
 * 2. Upload video or record audio
 * 3. Share GPS location
 * 4. Add details about the situation
 * 5. Send SOS signal to emergency services
 */

// ---- IMPORTS ----

// useState: Lets us remember values that can change (like form selections)
import { useState } from "react";

// Icons for different parts of the page
import { 
  AlertTriangle,  // ⚠️ Warning icon for header
  Video,          // 📹 Video recording
  Mic,            // 🎤 Audio recording
  MapPin,         // 📍 Location
  Upload,         // ⬆️ File upload
  Phone,          // 📞 Call button
  Send,           // ➡️ Send button
  CheckCircle     // ✓ Success checkmark
} from "lucide-react";

// UI Components - reusable building blocks
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";  // For showing popup messages

/**
 * EMERGENCY TYPES
 * 
 * List of different emergency situations a user can select.
 * Each has an ID, display label, and emoji icon.
 */
const emergencyTypes = [
  { id: "flood", label: "Flood", icon: "🌊" },
  { id: "fire", label: "Fire", icon: "🔥" },
  { id: "earthquake", label: "Earthquake", icon: "🏚️" },
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "trapped", label: "Trapped", icon: "🆘" },
  { id: "other", label: "Other", icon: "⚠️" },
];

/**
 * SOS PAGE COMPONENT
 */
export default function SOS() {
  // ---- STATE VARIABLES ----
  // These remember user selections and form status
  
  const [selectedType, setSelectedType] = useState<string | null>(null);  // Which emergency type is selected
  const [isRecording, setIsRecording] = useState(false);                   // Is audio recording active?
  const [hasLocation, setHasLocation] = useState(false);                   // Did we get GPS location?
  const [submitted, setSubmitted] = useState(false);                       // Was the form submitted?
  
  const { toast } = useToast();  // Function to show popup messages

  /**
   * GET USER'S GPS LOCATION
   * 
   * This function asks the browser for the user's location.
   * It shows a success or error message based on the result.
   */
  const handleGetLocation = () => {
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // SUCCESS: Location obtained
        () => {
          setHasLocation(true);
          toast({
            title: "Location captured",
            description: "Your GPS coordinates have been recorded.",
          });
        },
        // ERROR: Could not get location
        () => {
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Unable to get your location. Please enter manually.",
          });
        }
      );
    }
  };

  /**
   * SUBMIT THE SOS FORM
   * 
   * This function is called when the user clicks "Send SOS Signal".
   * It marks the form as submitted and shows a confirmation.
   */
  const handleSubmit = () => {
    setSubmitted(true);
    toast({
      title: "SOS Signal Sent",
      description: "Emergency services have been notified. Help is on the way.",
    });
  };

  // ============================================
  // SUCCESS SCREEN
  // Show this after the form is submitted
  // ============================================
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card variant="safe" className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            {/* Success icon */}
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            
            {/* Success message */}
            <h2 className="text-2xl font-bold mb-2">SOS Signal Received</h2>
            <p className="text-muted-foreground mb-6">
              Your emergency request has been sent to rescue teams. 
              Stay calm and remain in a safe location if possible.
            </p>
            
            {/* Reference information */}
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Reference ID: <span className="text-primary">SOS-2024-4521</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Estimated response: 8-12 minutes
              </p>
            </div>
            
            {/* Action buttons */}
            <Button variant="emergency" className="mt-6 w-full" size="lg">
              <Phone className="h-5 w-5" />
              Call Emergency: 100
            </Button>
            <Button 
              variant="outline" 
              className="mt-3 w-full"
              onClick={() => setSubmitted(false)}  // Reset to show form again
            >
              Send Another SOS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // MAIN SOS FORM
  // Show this when the form hasn't been submitted yet
  // ============================================
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* ---- HEADER ---- */}
      <div className="text-center">
        {/* Warning icon with pulsing animation */}
        <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4 pulse-emergency">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Emergency SOS</h1>
        <p className="text-muted-foreground mt-2">
          Send an emergency signal with your location and situation details
        </p>
      </div>

      {/* ---- EMERGENCY TYPE SELECTION ---- */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Type of Emergency</CardTitle>
          <CardDescription>Select the type of emergency you're experiencing</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Grid of emergency type buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {emergencyTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}  // Highlight if selected
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setSelectedType(type.id)}  // Select this type when clicked
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---- VIDEO AND AUDIO UPLOAD ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        
        {/* Video Upload Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video Upload
            </CardTitle>
            <CardDescription>
              Record a 5-second video of your surroundings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Drag and drop area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, MOV up to 50MB
              </p>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Video className="h-4 w-4" />
              Record Video
            </Button>
          </CardContent>
        </Card>

        {/* Audio Recording Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Audio Distress Signal
            </CardTitle>
            <CardDescription>
              Record an audio message describing your situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Recording indicator area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isRecording 
                  ? "border-destructive bg-destructive/10"  // Red when recording
                  : "border-border hover:border-primary/50"  // Normal when not recording
              }`}
            >
              <Mic className={`h-8 w-8 mx-auto mb-2 ${
                isRecording 
                  ? "text-destructive animate-pulse"  // Pulsing red when recording
                  : "text-muted-foreground"
              }`} />
              <p className="text-sm text-muted-foreground">
                {isRecording ? "Recording..." : "Click to start recording"}
              </p>
            </div>
            <Button 
              variant={isRecording ? "destructive" : "outline"}
              className="w-full mt-4"
              onClick={() => setIsRecording(!isRecording)}  // Toggle recording
            >
              <Mic className="h-4 w-4" />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ---- LOCATION AND DETAILS ---- */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location & Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Location button and status */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant={hasLocation ? "safe" : "default"}  // Green when location is captured
              className="flex-1"
              onClick={handleGetLocation}
            >
              <MapPin className="h-4 w-4" />
              {hasLocation ? "Location Captured" : "Get My Location"}
            </Button>
            {hasLocation && (
              <Badge variant="outline" className="self-center">
                GPS: 40.7128° N, 74.0060° W
              </Badge>
            )}
          </div>
          
          {/* Address input */}
          <div>
            <Label htmlFor="address">Address (Optional)</Label>
            <Input 
              id="address" 
              placeholder="Enter your address or landmark"
              className="mt-1.5"
            />
          </div>
          
          {/* Situation details */}
          <div>
            <Label htmlFor="details">Situation Details</Label>
            <Textarea 
              id="details" 
              placeholder="Describe your emergency situation, number of people, injuries, etc."
              className="mt-1.5 min-h-[100px]"
            />
          </div>
          
          {/* Additional info: people count and phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="people">Number of People</Label>
              <Input 
                id="people" 
                type="number" 
                placeholder="1"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+91 1234567890"
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- SUBMIT BUTTON ---- */}
      <Button 
        variant="emergency" 
        size="xl" 
        className="w-full"
        onClick={handleSubmit}
      >
        <Send className="h-5 w-5" />
        Send SOS Signal
      </Button>

      {/* Privacy notice */}
      <p className="text-center text-sm text-muted-foreground">
        By sending this SOS, you consent to sharing your location with emergency services
      </p>
    </div>
  );
}
