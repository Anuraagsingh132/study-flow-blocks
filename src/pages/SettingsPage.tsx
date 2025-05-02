
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" defaultValue="Student" />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="student@example.com" />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <select 
              id="timezone" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>UTC-8 Pacific Time (US & Canada)</option>
              <option>UTC-5 Eastern Time (US & Canada)</option>
              <option>UTC+0 London</option>
              <option>UTC+1 Paris, Berlin</option>
              <option>UTC+5:30 India</option>
              <option>UTC+8 Singapore, Hong Kong</option>
              <option>UTC+9 Tokyo</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <Button>Save Changes</Button>
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
            <select 
              id="theme" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System Default</option>
            </select>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="font-size">Font Size</Label>
            <select 
              id="font-size" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations" className="text-base">UI Animations</Label>
              <p className="text-sm text-gray-500">Enable animations throughout the app</p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
        </div>
        
        <div className="mt-6">
          <Button>Save Preferences</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
