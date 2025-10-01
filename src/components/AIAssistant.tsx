import { useState } from "react";
import { X, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AIChatInput } from "./AIChatInput";
import { chatWithAI, ChatResponse } from "@/services/claudeAPI";
import { ForexPair } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  buttons?: ChatResponse["buttons"];
}

interface AIAssistantProps {
  pairs: ForexPair[];
  openPositions: number;
  onClose?: () => void;
  onTradeFromAI?: (trade: NonNullable<ChatResponse["buttons"]>[0]) => void;
}

export const AIAssistant = ({ pairs, openPositions, onClose, onTradeFromAI }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI trading assistant. I can help you analyze markets, suggest trades, and answer questions. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(message, { pairs, openPositions });
      const assistantMessage: Message = {
        role: "assistant",
        content: response.text,
        buttons: response.buttons,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={cn("max-w-[80%] space-y-2")}>
              <div
                className={cn(
                  "rounded-lg p-3",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="space-y-2">
                  {msg.buttons.map((btn, btnIdx) => (
                    <Button
                      key={btnIdx}
                      variant={btn.direction === "BUY" ? "buy" : "sell"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onTradeFromAI?.(btn)}
                    >
                      {btn.direction} {btn.pair} @ {btn.entry} ({btn.lots} lots)
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <AIChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </Card>
  );
};
