interface TradeEvent {
  timestamp: number;
  type: 'trade' | 'loss' | 'positionSize' | 'chartCheck';
  value?: number;
}

interface EmotionState {
  score: number;
  events: TradeEvent[];
  lastUpdate: number;
}

const STORAGE_KEY = 'emotion_state';
const DECAY_RATE = 0.5; // Points recovered per hour
const MAX_SCORE = 100;

class EmotionDetectionSystem {
  private state: EmotionState;

  constructor() {
    this.state = this.loadState();
    this.startDecayTimer();
  }

  private loadState(): EmotionState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        events: parsed.events.filter((e: TradeEvent) => 
          Date.now() - e.timestamp < 24 * 60 * 60 * 1000 // Keep last 24h
        )
      };
    }
    return {
      score: MAX_SCORE,
      events: [],
      lastUpdate: Date.now()
    };
  }

  private saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private startDecayTimer() {
    setInterval(() => {
      const hoursPassed = (Date.now() - this.state.lastUpdate) / (60 * 60 * 1000);
      if (hoursPassed >= 1) {
        this.state.score = Math.min(MAX_SCORE, this.state.score + DECAY_RATE);
        this.state.lastUpdate = Date.now();
        this.saveState();
      }
    }, 60 * 1000); // Check every minute
  }

  getScore(): number {
    return Math.max(0, Math.min(MAX_SCORE, this.state.score));
  }

  getEmotionLevel(): 'excellent' | 'good' | 'neutral' | 'risky' | 'danger' {
    const score = this.getScore();
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'neutral';
    if (score >= 40) return 'risky';
    return 'danger';
  }

  getBorderColor(): string {
    const level = this.getEmotionLevel();
    const colors = {
      excellent: 'hsl(var(--emotion-excellent))',
      good: 'hsl(var(--emotion-good))',
      neutral: 'hsl(var(--emotion-neutral))',
      risky: 'hsl(var(--emotion-risky))',
      danger: 'hsl(var(--emotion-danger))'
    };
    return colors[level];
  }

  recordTrade() {
    const now = Date.now();
    const recentTrades = this.state.events.filter(
      e => e.type === 'trade' && now - e.timestamp < 10 * 60 * 1000
    );

    if (recentTrades.length >= 3) {
      this.adjustScore(-20, 'Multiple trades detected (FOMO)');
    }

    this.state.events.push({ timestamp: now, type: 'trade' });
    this.saveState();
  }

  recordTradeAfterLoss() {
    this.adjustScore(-30, 'Trading after loss detected (Revenge trading)');
    this.state.events.push({ timestamp: Date.now(), type: 'loss' });
    this.saveState();
  }

  recordPositionSize(size: number, normalSize: number) {
    if (size >= normalSize * 3) {
      this.adjustScore(-15, 'Unusually large position (Overconfidence)');
      this.state.events.push({ 
        timestamp: Date.now(), 
        type: 'positionSize',
        value: size 
      });
      this.saveState();
    }
  }

  recordChartCheck() {
    const now = Date.now();
    const recentChecks = this.state.events.filter(
      e => e.type === 'chartCheck' && now - e.timestamp < 30 * 1000
    );

    if (recentChecks.length >= 1) {
      this.adjustScore(-10, 'Frequent chart checking (Anxiety)');
    }

    this.state.events.push({ timestamp: now, type: 'chartCheck' });
    this.saveState();
  }

  private adjustScore(delta: number, reason?: string) {
    this.state.score = Math.max(0, Math.min(MAX_SCORE, this.state.score + delta));
    this.state.lastUpdate = Date.now();
    
    if (reason && delta < 0) {
      console.log(`Emotion score adjusted: ${delta} (${reason})`);
    }
  }

  shouldShowWarning(): boolean {
    return this.getScore() < 40;
  }

  getWarningMessage(): string {
    const patterns: string[] = [];
    const now = Date.now();

    const recentTrades = this.state.events.filter(
      e => e.type === 'trade' && now - e.timestamp < 10 * 60 * 1000
    ).length;

    if (recentTrades >= 3) patterns.push(`${recentTrades} trades in 10 minutes`);
    
    const recentLosses = this.state.events.filter(
      e => e.type === 'loss' && now - e.timestamp < 5 * 60 * 1000
    ).length;

    if (recentLosses > 0) patterns.push('trading after losses');

    if (patterns.length === 0) {
      return 'Your trading pattern suggests high risk. Consider taking a break.';
    }

    return `Risky behavior detected: ${patterns.join(', ')}. Statistics suggest this increases loss probability.`;
  }

  reset() {
    this.state = {
      score: MAX_SCORE,
      events: [],
      lastUpdate: Date.now()
    };
    this.saveState();
  }
}

export const emotionDetector = new EmotionDetectionSystem();
