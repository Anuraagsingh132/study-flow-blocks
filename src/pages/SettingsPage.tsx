
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserPreferences, updateUserPreferences } from "@/services/supabase/userPreferences";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Account settings
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  
  // User preferences
  const [timezone, setTimezone] = useState("UTC");
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Set account info from auth
      if (user) {
        setEmail(user.email || "");
        // Try to extract name from user metadata if available
        const metadata = user.user_metadata;
        if (metadata && metadata.name) {
          setDisplayName(metadata.name);
        } else {
          setDisplayName(user.email?.split('@')[0] || "Student");
        }
      }
      
      // Load user preferences
      const preferences = await getUserPreferences();
      
      setTimezone(preferences.timezone);
      setTheme(preferences.theme);
      setFontSize(preferences.font_size);
      setAnimationsEnabled(preferences.animations_enabled);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user settings");
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    try {
      setSaving(true);
      
      await updateUserPreferences({
        timezone,
        theme,
        font_size: fontSize,
        animations_enabled: animationsEnabled
      });
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving user preferences:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Common timezone options
  const timezoneOptions = [
    "UTC",
    "UTC-8 Pacific Time (US & Canada)",
    "UTC-7 Mountain Time (US & Canada)",
    "UTC-6 Central Time (US & Canada)",
    "UTC-5 Eastern Time (US & Canada)",
    "UTC+0 London",
    "UTC+1 Paris, Berlin",
    "UTC+2 Athens, Cairo",
    "UTC+3 Moscow, Istanbul",
    "UTC+5:30 India",
    "UTC+8 Singapore, Hong Kong",
    "UTC+9 Tokyo",
    "UTC+10 Sydney"
  ];

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              disabled 
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminder-notifications" className="text-base">Study Reminders</Label>
              <p className="text-sm text-gray-500">Get notifications before scheduled study sessions</p>
            </div>
            <Switch id="reminder-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="goal-notifications" className="text-base">Goal Updates</Label>
              <p className="text-sm text-gray-500">Notifications for goal deadlines and progress</p>
            </div>
            <Switch id="goal-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newsletter" className="text-base">Study Tips Newsletter</Label>
              <p className="text-sm text-gray-500">Weekly newsletter with study tips and advice</p>
            </div>
            <Switch id="newsletter" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Appearance</h2>
        
        <div className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="font-size">Font Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="font-size">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations" className="text-base">UI Animations</Label>
              <p className="text-sm text-gray-500">Enable animations throughout the app</p>
            </div>
            <Switch 
              id="animations" 
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <Button onClick={saveUserPreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
