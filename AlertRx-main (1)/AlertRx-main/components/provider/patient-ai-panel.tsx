"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, BrainCircuit, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MedicationSummary {
  drugName: string;
  dosage?: string;
  frequency?: string;
  indication?: string;
  status?: string;
}

interface AlertSummary {
  description?: string;
  severity?: string;
  type?: string;
}

interface PatientAiPanelProps {
  patient: {
    id?: string;
    patientId?: string;
    name?: string;
    phone?: string;
    email?: string;
    age?: number;
    gender?: string;
    adherenceScore?: number;
    activeMedications?: number;
    unresolvedAlerts?: number;
    [key: string]: any;
  };
  medications: MedicationSummary[];
}

interface ClassificationResult {
  topRecommendation?: {
    drug?: string;
    drugName?: string;
    confidence?: number;
    confidenceScore?: number;
  };
  confidenceScore?: number;
  confidence?: number;
  probabilityDistribution?: Array<{ label?: string; drug?: string; probability?: number; score?: number }>;
  distribution?: Array<{ label?: string; drug?: string; probability?: number; score?: number }>;
  probabilities?: Array<{ label?: string; drug?: string; probability?: number; score?: number }>;
  [key: string]: any;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function getTopRecommendation(result: ClassificationResult | null) {
  const topRecommendation = result?.topRecommendation;
  const drugName = topRecommendation?.drugName ?? topRecommendation?.drug ?? result?.drug ?? null;
  const confidence =
    topRecommendation?.confidence ??
    topRecommendation?.confidenceScore ??
    result?.confidenceScore ??
    result?.confidence ??
    null;
  const distribution =
    result?.probabilityDistribution ??
    result?.distribution ??
    result?.probabilities ??
    [];

  return { drugName, confidence, distribution };
}

function extractReply(payload: any) {
  if (!payload) return "No response received.";
  if (typeof payload === "string") return payload;
  if (typeof payload?.reply === "string") return payload.reply;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.response === "string") return payload.response;
  if (typeof payload?.content === "string") return payload.content;
  if (Array.isArray(payload?.choices) && payload.choices[0]?.message?.content) {
    return payload.choices[0].message.content;
  }
  return JSON.stringify(payload, null, 2);
}

export function PatientAiPanel({ patient, medications }: PatientAiPanelProps) {
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const patientContext = useMemo(() => {
    const alerts = Array.isArray((patient as any)?.recentAlerts)
      ? (patient as any).recentAlerts
      : [];

    return {
      patientId: patient.patientId ?? patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      age: patient.age,
      gender: patient.gender,
      adherenceScore: patient.adherenceScore,
      activeMedications: medications.map((med) => ({
        drugName: med.drugName,
        dosage: med.dosage,
        frequency: med.frequency,
        indication: med.indication,
        status: med.status,
      })),
      alerts: alerts.map((alert: AlertSummary) => ({
        description: alert.description,
        severity: alert.severity,
        type: alert.type,
      })),
      allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
      chronicConditions: Array.isArray(patient.chronicConditions)
        ? patient.chronicConditions
        : [],
      summary: `Provider review for ${patient.name ?? "patient"}.`,
    };
  }, [patient, medications]);

  useEffect(() => {
    let isMounted = true;

    async function runClassification() {
      setIsClassifying(true);
      setClassificationError(null);

      try {
        const response = await fetch("http://localhost:3001/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientContext),
        });

        if (!response.ok) {
          throw new Error(`Classifier request failed (${response.status})`);
        }

        const data = await response.json();
        if (isMounted) {
          setClassification(data);
        }
      } catch (error) {
        if (isMounted) {
          setClassificationError(
            error instanceof Error ? error.message : "Unable to classify resistance right now."
          );
        }
      } finally {
        if (isMounted) {
          setIsClassifying(false);
        }
      }
    }

    void runClassification();

    return () => {
      isMounted = false;
    };
  }, [patientContext]);

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setChatError(null);
    setIsChatting(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          patientContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed (${response.status})`);
      }

      const data = await response.json();
      const assistantReply = extractReply(data);
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: assistantReply,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Unable to reach the clinician AI chat.");
    } finally {
      setIsChatting(false);
    }
  }

  const { drugName, confidence, distribution } = getTopRecommendation(classification);
  const suggestedPrompts = [
    "Explain the resistance risk in simple terms.",
    "What treatment rationale should I mention to the caregiver?",
    "Suggest the next step for this patient case.",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Resistance classifier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Live recommendation</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>

            {isClassifying ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending patient case to the resistance model…
              </div>
            ) : classificationError ? (
              <p className="text-sm text-destructive">{classificationError}</p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md border border-primary/20 bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Top drug
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {drugName ?? "Awaiting classifier output"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {confidence != null ? `${Math.round(confidence * 100)}%` : "—"}
                  </p>
                </div>

                {distribution.length > 0 && (
                  <div className="space-y-2">
                    {distribution.map((item, index) => {
                      const label = item.label ?? item.drug ?? `Option ${index + 1}`;
                      const probability = item.probability ?? item.score ?? 0;
                      return (
                        <div key={`${label}-${index}`}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span>{label}</span>
                            <span className="font-medium text-foreground">
                              {Math.round(probability * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.max(4, probability * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Clinician AI chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Patient context is included with every message.
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs text-primary transition hover:border-primary/40 hover:bg-primary/5"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {messages.length === 0 && !chatError && (
                <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  Ask for treatment rationale, resistance explanation, or next-step suggestions.
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-md border p-3 text-sm ${
                    message.role === "assistant"
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {message.role === "assistant" ? "AI assistant" : "You"}
                  </p>
                  <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                </div>
              ))}
              {chatError && <p className="text-sm text-destructive">{chatError}</p>}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about the case…"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0"
            />
            <Button type="submit" disabled={isChatting || !draft.trim()}>
              {isChatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
