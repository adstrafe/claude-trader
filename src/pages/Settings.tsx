import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, CreditCard, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RISK_PROFILES, useRiskProfile } from "@/lib/riskProfiles";
import { toast } from "sonner";

export default function Settings() {
  const { getProfile, setProfile } = useRiskProfile();
  const [selectedRisk, setSelectedRisk] = useState(getProfile().name.toUpperCase());
  const [aiPersonality, setAiPersonality] = useState(
    localStorage.getItem('ai_personality') || 'polite'
  );

  const handleRiskProfileChange = (profile: string) => {
    setSelectedRisk(profile);
    setProfile(profile);
    toast.success(`Risk profile changed to ${RISK_PROFILES[profile].name}`);
  };

  const handlePersonalityChange = (personality: string) => {
    localStorage.setItem('ai_personality', personality);
    setAiPersonality(personality);
    toast.success(`AI personality set to ${personality === 'polite' ? 'Polite Assistant' : 'Brutal Honesty'} mode`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-card z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="risk">
              <Shield className="h-4 w-4 mr-2" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Demo User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="demo@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="+1 234 567 8900" />
              </div>
              <Button>Save Changes</Button>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-primary/5 border-primary">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Demo Account</h3>
                    <span className="text-sm px-3 py-1 rounded-full bg-primary text-primary-foreground">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Educational demo with unlimited virtual trading
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Unlimited virtual balance</li>
                    <li>✓ AI trading assistant</li>
                    <li>✓ Real-time market simulation</li>
                    <li>✓ Full platform features</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a demo platform for educational purposes only. No real money or trading occurs.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Risk Profile</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose your risk management approach. This affects maximum lot sizes and risk warnings.
              </p>
              <div className="space-y-4">
                {Object.entries(RISK_PROFILES).map(([key, profile]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedRisk === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/5"
                    }`}
                    onClick={() => handleRiskProfileChange(key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{profile.name}</h3>
                      {selectedRisk === key && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{profile.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Max Lots:</span>
                        <div className="font-semibold">{profile.maxLots}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Warn:</span>
                        <div className="font-semibold">{profile.warnThreshold}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Block:</span>
                        <div className="font-semibold">{profile.blockThreshold}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">AI Personality</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how the AI assistant communicates with you
                </p>
                <div className="space-y-3">
                  <div
                    onClick={() => handlePersonalityChange('polite')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      aiPersonality === 'polite'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium mb-1">Polite Assistant</div>
                    <p className="text-sm text-muted-foreground">
                      Professional and courteous communication style
                    </p>
                  </div>
                  <div
                    onClick={() => handlePersonalityChange('brutal')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      aiPersonality === 'brutal'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium mb-1">Brutal Honesty</div>
                    <p className="text-sm text-muted-foreground">
                      Direct, no-nonsense feedback on your trading decisions
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "This is your 3rd impulsive trade today. Statistics say you're about to lose money 🤷"
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
