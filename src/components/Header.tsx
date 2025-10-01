import { useState } from "react";
import { Menu, Moon, Sun, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionScoreBar } from "@/components/EmotionScoreBar";
import { Link } from "react-router-dom";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  balance?: number;
}

export function Header({ darkMode, onToggleDarkMode, balance = 50000 }: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="border-b sticky top-0 bg-card z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-md font-bold">OnlyPrompts<br />Trading</h1>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Balance:</span>
            <span className="data-cell font-semibold">${balance.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          <EmotionScoreBar />
          <Link to="/history">
            <Button variant="ghost" size="sm">
              History
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm">
              Settings
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t bg-card">
          <div className="px-4 py-3 space-y-3">
            {/* Balance */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Balance:</span>
              <span className="data-cell font-semibold">${balance.toFixed(2)}</span>
            </div>

            {/* Emotional State Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Emotional State:</span>
              <EmotionScoreBar />
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link to="/history" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  History
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={onToggleDarkMode}
              >
                {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
