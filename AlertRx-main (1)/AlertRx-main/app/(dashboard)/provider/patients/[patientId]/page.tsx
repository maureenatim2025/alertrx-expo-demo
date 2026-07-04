import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPatientSummary } from "@/lib/services/patients.service";
import { getMedicationsForPatient } from "@/lib/services/medications.service";
import { MedicationCard } from "@/components/patient/medication-card";
import { AlertBadge } from "@/components/shared/alert-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, FileText, Pill, Bell, User, Activity, HeartPulse, CalendarCheck, ShieldAlert, ClipboardList } from "lucide-react";
import { PatientAiPanel } from "@/components/provider/patient-ai-panel";

export const metadata: Metadata = { title: "Patient Details" };

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;
  const session = await auth();
  if (
    !session?.user ||
    !["provider", "pharmacist", "admin"].includes(session.user.role)
  ) {
    redirect("/login");
  }

  const [summaryResult, medsResult] = await Promise.all([
    getPatientSummary(patientId),
    getMedicationsForPatient(patientId),
  ]);

  if (!summaryResult) notFound();

  const patient = summaryResult;
  const medications = medsResult.data ?? [];
  const active = medications.filter((m) => m.status === "active");

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${session.user.role}/search`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground text-sm font-mono">
              {patient.patientId}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground">Risk</p>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-semibold capitalize">
                  {patient.preConsultationSignals?.resistanceRisk ?? "low"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground">Adherence Concern</p>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  {patient.preConsultationSignals?.adherenceConcern ? "Yes" : "No"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground">Drug interaction</p>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-700" />
                <span className="text-sm font-semibold">
                  {patient.preConsultationSignals?.drugInteractionRisk ? "Possible" : "None"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5 space-y-2">
            <p className="text-xs text-muted-foreground">Adherence Score</p>
            <div className="flex items-center gap-2">
              <Progress value={patient.adherenceScore} className="flex-1" />
              <span
                className={`text-sm font-bold ${
                  (patient.adherenceScore ?? 0) >= 80
                    ? "text-green-600"
                    : (patient.adherenceScore ?? 0) >= 50
                    ? "text-yellow-600"
                    : "text-destructive"
                }`}
              >
                {patient.adherenceScore ?? 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Active Medications</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {patient.activeMedications}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Unresolved Alerts</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                (patient.unresolvedAlerts ?? 0) > 0 ? "text-destructive" : "text-primary"
              }`}
            >
              {patient.unresolvedAlerts}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link href={`/provider/prescriptions/new?patientId=${patientId}`}>
            <FileText className="h-4 w-4" />
            New Prescription
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link href={`/provider/patients/${patientId}/history`}>
            <CalendarCheck className="h-4 w-4" />
            Drug History Timeline
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground">Vitals</p>
                  <div className="space-y-1 text-sm">
                    <p>BP: {patient.vitals?.bloodPressure ?? "—"}</p>
                    <p>HR: {patient.vitals?.heartRate ?? "—"} bpm</p>
                    <p>RR: {patient.vitals?.respiratoryRate ?? "—"} /min</p>
                    <p>Temp: {patient.vitals?.temperature ?? "—"}</p>
                    <p>Weight: {patient.vitals?.weight ?? "—"}</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground">Symptoms</p>
                  <div className="space-y-1 text-sm">
                    {patient.symptoms && patient.symptoms.length > 0 ? (
                      patient.symptoms.map((symptom, index) => (
                        <p key={index}>• {symptom}</p>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No symptoms logged.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-xs text-muted-foreground">Delivery Info</p>
                <div className="space-y-1 text-sm">
                  <p>Address: {patient.deliveryInfo?.address ?? "Unknown"}</p>
                  <p>Preferred: {patient.deliveryInfo?.preferredMethod ?? "—"}</p>
                  <p>
                    Last delivery: {
                      patient.deliveryInfo?.lastDeliveredAt
                        ? format(new Date(patient.deliveryInfo.lastDeliveredAt), "MMM d, yyyy")
                        : "—"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.recentMedications && patient.recentMedications.length > 0 ? (
                patient.recentMedications.map((med, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{med.medicationName}</p>
                      <Badge variant="secondary" className="text-xs">
                        {med.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {med.dosage} · {med.frequency.replace(/_/g, " ")} · {med.route}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {med.reason ?? "No indication recorded"}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Pill}
                  title="No recent medication history"
                  description="This patient has no recent medication records to show."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <PatientAiPanel patient={patient as any} medications={medications} />
      </div>

      <Tabs defaultValue="medications">
        <TabsList>
          <TabsTrigger value="medications">
            Medications ({active.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts ({patient.unresolvedAlerts})
          </TabsTrigger>
          <TabsTrigger value="info">Patient Info</TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="mt-4">
          {active.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {active.map((med) => (
                <MedicationCard
                  key={med._id?.toString()}
                  id={med._id?.toString() ?? ""}
                  drugName={med.drugName}
                  dosage={med.dosage}
                  frequency={med.frequency}
                  routeOfAdministration={med.routeOfAdministration}
                  startDate={med.startDate?.toString() ?? ""}
                  endDate={med.endDate?.toString()}
                  indication={med.indication}
                  status={med.status as any}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Pill}
              title="No active medications"
              description="This patient has no active medications logged."
            />
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          {patient.recentAlerts && patient.recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {patient.recentAlerts.map((alert, index) => (
                <Card key={index}>
                  <CardContent className="pt-4 flex items-start gap-3">
                    <AlertBadge severity={alert.severity} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <p className="text-sm">{alert.description}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{alert.type.replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>{format(new Date(alert.createdAt), "MMM d, yyyy h:mm a")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No alerts"
              description="No alerts have been generated for this patient yet."
            />
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{patient.phone}</p>
                </div>
                {patient.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{patient.email}</p>
                  </div>
                )}
                {(patient as any).dateOfBirth && (
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p>{format(new Date((patient as any).dateOfBirth), "MMM d, yyyy")}</p>
                  </div>
                )}
                {patient.gender && (
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="capitalize">{patient.gender.replace(/_/g, " ")}</p>
                  </div>
                )}
              </div>
              {(patient as any).allergies && (patient as any).allergies.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).allergies.map((a: string) => (
                      <Badge key={a} variant="destructive" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(patient as any).chronicConditions && (patient as any).chronicConditions.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Chronic Conditions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(patient as any).chronicConditions.map((c: string) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
