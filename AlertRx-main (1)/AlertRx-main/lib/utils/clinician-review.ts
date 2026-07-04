export interface ClinicianReviewInput {
  adherenceScore?: number;
  unresolvedAlerts?: number;
  preConsultationSignals?: {
    resistanceRisk?: string;
    adherenceConcern?: boolean;
    drugInteractionRisk?: boolean;
  };
  recentAlerts?: Array<{
    severity?: string;
    type?: string;
    description?: string;
  }>;
}

export interface ClinicianReviewSnapshot {
  severity: "high" | "moderate" | "low";
  title: string;
  summary: string;
  nextAction: string;
  signals: string[];
}

export function buildClinicianReviewSnapshot(input: ClinicianReviewInput): ClinicianReviewSnapshot {
  const resistanceRisk = input.preConsultationSignals?.resistanceRisk ?? "low";
  const adherenceConcern = input.preConsultationSignals?.adherenceConcern ?? false;
  const drugInteractionRisk = input.preConsultationSignals?.drugInteractionRisk ?? false;
  const adherenceScore = input.adherenceScore ?? 100;
  const unresolvedAlerts = input.unresolvedAlerts ?? 0;

  const signals: string[] = [];

  if (resistanceRisk === "high") {
    signals.push("high resistance risk detected");
  } else if (resistanceRisk === "moderate") {
    signals.push("moderate resistance risk detected");
  } else {
    signals.push("resistance risk is currently low");
  }

  if (adherenceConcern) {
    signals.push("adherence concern requires follow-up");
  }

  if (drugInteractionRisk) {
    signals.push("Possible drug interaction identified");
  }

  if (unresolvedAlerts > 0) {
    signals.push(`${unresolvedAlerts} unresolved alert${unresolvedAlerts > 1 ? "s" : ""} pending review`);
  }

  const urgent = resistanceRisk === "high" || drugInteractionRisk || unresolvedAlerts > 1 || (adherenceScore < 40 && adherenceConcern);
  const severity: ClinicianReviewSnapshot["severity"] = urgent ? "high" : adherenceConcern || unresolvedAlerts > 0 ? "moderate" : "low";

  const title = severity === "high"
    ? "Urgent clinician review needed"
    : severity === "moderate"
      ? "Review recommended before consultation"
      : "Routine review ready";

  const summary = severity === "high"
    ? "This case should be reviewed urgently because the clinical signals suggest a high-risk treatment decision."
    : severity === "moderate"
      ? "The case shows moderate concern and is worth reviewing before the appointment."
      : "The case appears stable and can be reviewed during the normal workflow.";

  const nextAction = severity === "high"
    ? "Prioritize an urgent review and prepare a clear treatment recommendation."
    : severity === "moderate"
      ? "Review the patient context and confirm the next step before consultation."
      : "Continue with the standard case review and documentation.";

  return { severity, title, summary, nextAction, signals };
}
