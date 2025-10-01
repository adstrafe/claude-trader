export interface RiskProfile {
  name: string;
  description: string;
  warnThreshold: number;
  blockThreshold: number;
  maxLots: number;
}

export const RISK_PROFILES: Record<string, RiskProfile> = {
  GUARDIAN: {
    name: "Guardian",
    description: "Conservative approach with strict limits",
    warnThreshold: 30,
    blockThreshold: 50,
    maxLots: 0.2,
  },
  COPILOT: {
    name: "Copilot",
    description: "Balanced risk management (default)",
    warnThreshold: 50,
    blockThreshold: 70,
    maxLots: 0.5,
  },
  MAVERICK: {
    name: "Maverick",
    description: "Aggressive trading with higher limits",
    warnThreshold: 70,
    blockThreshold: 85,
    maxLots: 10,
  },
};

export const useRiskProfile = () => {
  const getProfile = (): RiskProfile => {
    const stored = localStorage.getItem("riskProfile");
    return RISK_PROFILES[stored || "COPILOT"];
  };
  
  const setProfile = (profileName: string) => {
    localStorage.setItem("riskProfile", profileName);
  };
  
  return { getProfile, setProfile };
};
