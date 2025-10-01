import { toast } from "sonner";

interface AlertPattern {
  type: string;
  message: string;
  explanation: string;
}

const patterns: AlertPattern[] = [
  {
    type: 'rapid_trading',
    message: '3rd trade in 10 minutes',
    explanation: 'Rapid trading often indicates emotional decision-making. Consider reviewing your strategy before continuing.'
  },
  {
    type: 'unusual_size',
    message: 'Position size unusual',
    explanation: 'This position is significantly larger than your typical size. Ensure this aligns with your risk management plan.'
  },
  {
    type: 'loss_streak',
    message: 'Trading after 2 losses',
    explanation: 'Trading after consecutive losses increases the risk of revenge trading. Take a moment to reassess.'
  },
  {
    type: 'overtrading',
    message: 'High trading frequency detected',
    explanation: 'You\'ve made more trades than usual today. Quality over quantity leads to better results.'
  }
];

export function showBehavioralAlert(patternType: string) {
  const pattern = patterns.find(p => p.type === patternType);
  
  if (!pattern) return;

  toast.warning(pattern.message, {
    description: pattern.explanation,
    duration: 5000,
    action: {
      label: 'Understood',
      onClick: () => {}
    }
  });
}

export function checkRapidTrading(tradesInLast10Min: number) {
  if (tradesInLast10Min >= 3) {
    showBehavioralAlert('rapid_trading');
  }
}

export function checkUnusualSize(currentSize: number, averageSize: number) {
  if (currentSize > averageSize * 2) {
    showBehavioralAlert('unusual_size');
  }
}

export function checkLossStreak(consecutiveLosses: number) {
  if (consecutiveLosses >= 2) {
    showBehavioralAlert('loss_streak');
  }
}
