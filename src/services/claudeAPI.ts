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
}

export const generateTradeSuggestions = async (
  pairs: ForexPair[],
  riskProfile: RiskProfile
): Promise<TradeSuggestion[]> => {
  const prompt = `You are an AI trading assistant. Generate 5 diverse trade suggestions based on these forex pairs:

${pairs.map(p => `${p.symbol}: Current Price ${p.price}, 24h Change ${p.changePercent}%`).join("\n")}

User's risk profile: ${riskProfile.name} (max lots: ${riskProfile.maxLots}, risk threshold: ${riskProfile.blockThreshold})

Return ONLY a JSON array with this structure:
[
  {
    "pair": "USDJPY",
    "direction": "BUY" or "SELL",
    "entry": <current_price>,
    "takeProfit": <tp_price>,
    "stopLoss": <sl_price>,
    "lots": <0.01_to_max_lots>,
    "riskScore": <0_to_100>,
    "rationale": "<brief reason>"
  }
]

Make suggestions realistic with proper TP/SL distances and varying risk scores.`;

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
