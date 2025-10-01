import Anthropic from "@anthropic-ai/sdk";
import { ForexPair } from "@/lib/mockData";
import { RiskProfile } from "@/lib/riskProfiles";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Demo only
});

export interface TradeSuggestion {
  pair: string;
  direction: "BUY" | "SELL";
  entry: number;
  takeProfit: number;
  stopLoss: number;
  lots: number;
  riskScore: number;
  rationale: string;
  confidence?: number;
}

export const generateTradeSuggestions = async (
  pairs: ForexPair[],
  riskProfile: RiskProfile
): Promise<TradeSuggestion[]> => {
  const riskProfileGuidance = {
    GUARDIAN: "Conservative approach: Use small lot sizes (0.01-0.2), tight stops, low risk scores (20-40), focus on major pairs with stable trends",
    COPILOT: "Balanced approach: Use moderate lot sizes (0.1-0.5), standard stops, medium risk scores (40-60), mix of major and minor pairs",
    MAVERICK: "Aggressive approach: Use large lot sizes (1.0-10.0), wide stops, high risk scores (70-90), include volatile pairs like crypto and exotic currencies"
  };

  const prompt = `You are an AI trading assistant. Generate 5 diverse trade suggestions based on these forex pairs:

${pairs.map(p => `${p.symbol}: Current Price ${p.price}, 24h Change ${p.changePercent}%`).join("\n")}

User's risk profile: ${riskProfile.name} (max lots: ${riskProfile.maxLots}, risk threshold: ${riskProfile.blockThreshold})
${riskProfileGuidance[riskProfile.name as keyof typeof riskProfileGuidance] || riskProfileGuidance.COPILOT}

Return ONLY a JSON array with this structure:
[
  {
    "pair": "USDJPY",
    "direction": "BUY" or "SELL",
    "entry": <current_price>,
    "takeProfit": <tp_price>,
    "stopLoss": <sl_price>,
    "lots": <appropriate_for_risk_profile>,
    "riskScore": <appropriate_for_risk_profile>,
    "rationale": "<brief reason>",
    "confidence": <70-95_high_confidence_score>
  }
]

Make suggestions realistic with proper TP/SL distances. Tailor lot sizes and risk scores to match the risk profile characteristics.

IMPORTANT: Prioritize generating trades with HIGH CONFIDENCE (aim for 70-95% confidence scores). Focus on the most promising opportunities with strong technical setups, clear market signals, and favorable risk-reward ratios.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    return [];
  } catch (error) {
    console.error("AI suggestions error:", error);
    return [];
  }
};

export interface ChatResponse {
  text: string;
  buttons?: Array<{
    pair: string;
    direction: "BUY" | "SELL";
    entry: number;
    takeProfit: number;
    stopLoss: number;
    lots: number;
  }>;
}

export const chatWithAI = async (
  message: string,
  context: { pairs: ForexPair[]; openPositions: number }
): Promise<ChatResponse> => {
  const systemPrompt = `You are an AI trading assistant. Help users with trading questions.
  
Current market data:
${context.pairs.map(p => `${p.symbol}: ${p.price} (${p.changePercent > 0 ? '+' : ''}${p.changePercent}%)`).join(", ")}

User has ${context.openPositions} open position(s).

If suggesting a trade, include [TRADE_BUTTON:pair,direction,entry,tp,sl,lots] in your response.
Example: "I suggest buying EUR/USD [TRADE_BUTTON:EURUSD,BUY,1.0850,1.0950,1.0800,0.5]"`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        { role: "user", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const text = content.text;
      const buttons: ChatResponse["buttons"] = [];
      
      const buttonMatches = text.matchAll(/\[TRADE_BUTTON:([^,]+),([^,]+),([\d.]+),([\d.]+),([\d.]+),([\d.]+)\]/g);
      for (const match of buttonMatches) {
        buttons.push({
          pair: match[1],
          direction: match[2] as "BUY" | "SELL",
          entry: parseFloat(match[3]),
          takeProfit: parseFloat(match[4]),
          stopLoss: parseFloat(match[5]),
          lots: parseFloat(match[6]),
        });
      }
      
      return {
        text: text.replace(/\[TRADE_BUTTON:[^\]]+\]/g, "").trim(),
        buttons: buttons.length > 0 ? buttons : undefined,
      };
    }
    
    return { text: "I apologize, but I couldn't process that request." };
  } catch (error) {
    console.error("Chat error:", error);
    return { text: "I'm having trouble connecting right now. Please try again." };
  }
};
