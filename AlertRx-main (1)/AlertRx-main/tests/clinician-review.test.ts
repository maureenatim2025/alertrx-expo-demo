import assert from "node:assert/strict";
import { test } from "node:test";
import { buildClinicianReviewSnapshot } from "../lib/utils/clinician-review.ts";

test("flags urgent clinician review for high-risk cases", () => {
  const snapshot = buildClinicianReviewSnapshot({
    adhesionScore: 32,
    unresolvedAlerts: 2,
    preConsultationSignals: {
      resistanceRisk: "high",
      adherenceConcern: true,
      drugInteractionRisk: true,
    },
    recentAlerts: [{ severity: "high", type: "urgent_alert", description: "Neonate alert" }],
  });

  assert.equal(snapshot.severity, "high");
  assert.match(snapshot.title, /urgent/i);
  assert.match(snapshot.nextAction, /urgent|review/i);
  assert.ok(snapshot.signals.some((signal) => signal.includes("high resistance")));
});

test("uses a moderate review for moderate-risk cases", () => {
  const snapshot = buildClinicianReviewSnapshot({
    adherenceScore: 68,
    unresolvedAlerts: 1,
    preConsultationSignals: {
      resistanceRisk: "moderate",
      adherenceConcern: true,
      drugInteractionRisk: false,
    },
    recentAlerts: [{ severity: "medium", type: "adherence", description: "Missed dose" }],
  });

  assert.equal(snapshot.severity, "moderate");
  assert.match(snapshot.title, /review/i);
  assert.match(snapshot.summary, /adherence|review/i);
  assert.ok(snapshot.signals.some((signal) => signal.includes("adherence")));
});
