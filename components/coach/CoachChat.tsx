"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendCoachMessage } from "@/lib/api/coach";
import {
  getConversationHistory,
  saveMessage,
  clearConversationHistory,
} from "@/lib/supabase/conversations";
import { showError, showSuccess } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { CoachMessage, UserProfile } from "@/types";

interface CoachChatProps {
  userProfile: UserProfile;
}

export function CoachChat({ userProfile }: CoachChatProps) {
  const [messages, setMessages] = React.useState<CoachMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [showClearModal, setShowClearModal] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load conversation history on mount
  React.useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getConversationHistory();
        setMessages(history);
      } catch (error) {
        console.error("Failed to load conversation history:", error);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: CoachMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Save user message to database
      await saveMessage("user", userMessage.content);

      // Get AI response
      const response = await sendCoachMessage(
        userProfile,
        messages,
        userMessage.content
      );

      const assistantMessage: CoachMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      // Add assistant message
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      await saveMessage("assistant", assistantMessage.content);
    } catch (error) {
      console.error("Failed to get coach response:", error);
      showError(error, "general");
      
      // Remove the user message if it failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearConversationHistory();
      setMessages([]);
      showSuccess("Conversation cleared");
      setShowClearModal(false);
    } catch (error) {
      console.error("Failed to clear conversation:", error);
      showError(error, "general");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingHistory) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border bg-card shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="flex-shrink-0 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Financial Coach</CardTitle>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearModal(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-muted-foreground mb-2">
                Start a conversation with your financial coach
              </p>
              <p className="text-sm text-muted-foreground">
                Ask questions about your spending, get advice, or discuss your financial goals.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="flex-shrink-0 border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your financial coach a question..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClear}
        title="Clear conversation"
        description="Are you sure you want to clear your conversation history? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </>
  );
}
