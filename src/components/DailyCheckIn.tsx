import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Coffee, Zap, Battery, SkipForward } from "lucide-react";

type Mood = 'fresh' | 'tired' | 'pumped' | null;

const STORAGE_KEY = 'daily_checkin';

export function DailyCheckIn() {
  const [visible, setVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const lastCheckin = new Date(data.date);
      const today = new Date();
      
      // Check if last check-in was today
      if (lastCheckin.toDateString() === today.toDateString()) {
        return; // Don't show
      }
    }
    
    // Show after a brief delay
    setTimeout(() => setVisible(true), 1000);
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    const data = {
      mood,
      date: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Fade out after selection
    setTimeout(() => setVisible(false), 500);
  };

  const handleSkip = () => {
    handleMoodSelect(null);
  };

  if (!visible) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 relative animate-fade-in">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={handleSkip}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h3 className="text-sm font-semibold mb-2">How are you starting today?</h3>
      
      <div className="flex gap-2">
        <Button
          variant={selectedMood === 'fresh' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleMoodSelect('fresh')}
          className="flex-1"
        >
          <Coffee className="h-4 w-4 mr-1" />
          Fresh
        </Button>
        
        <Button
          variant={selectedMood === 'tired' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleMoodSelect('tired')}
          className="flex-1"
        >
          <Battery className="h-4 w-4 mr-1" />
          Tired
        </Button>
        
        <Button
          variant={selectedMood === 'pumped' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleMoodSelect('pumped')}
          className="flex-1"
        >
          <Zap className="h-4 w-4 mr-1" />
          Pumped
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="flex-1"
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Skip
        </Button>
      </div>
    </Card>
  );
}
