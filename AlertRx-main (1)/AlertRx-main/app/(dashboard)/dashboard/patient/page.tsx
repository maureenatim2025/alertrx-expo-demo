import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPatientDashboardData } from "@/lib/services/dashboard.service";
import { getPatientProfile } from "@/lib/services/patients.service";
import { MetricCard } from "@/components/shared/metric-card";
import { AdherenceChecklist } from "@/components/patient/adherence-checklist";
import { AlertBadge } from "@/components/shared/alert-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pill, TrendingUp, Bell, Plus, Clock, User, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  const profileResult = await getPatientProfile(session.user.id);
  const data = await getPatientDashboardData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good day, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s your medication summary for today.
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/medications/new">
            <Plus className="h-4 w-4" />
            Log Medication
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-5 bg-slate-50 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                My health records
              </p>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {session.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profileResult.profile?.patientId ?? "No AlertDrugRx ID yet"}
                  </p>
                </div>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/uploads">Upload records</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Documents
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.uploadCount}</p>
              <p className="text-sm text-muted-foreground">Uploaded files and records</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Active medications
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.activeMedications}</p>
              <p className="text-sm text-muted-foreground">Medications currently scheduled</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/dashboard/uploads"
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-primary/80"
            >
              <p className="text-sm font-semibold text-foreground">Add health or drug record</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a document or note to your record.
              </p>
            </Link>
            <Link
              href="/dashboard/medications"
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-primary/80"
            >
              <p className="text-sm font-semibold text-foreground">View medication schedule</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your current and past medications.
              </p>
            </Link>
            <Link
              href="/dashboard/profile"
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-primary/80"
            >
              <p className="text-sm font-semibold text-foreground">Update your profile</p>
              <p className="text-xs text-muted-foreground mt-1">
                Keep your personal and emergency details current.
              </p>
            </Link>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
            <div className="font-medium">Need help with your record?</div>
            <p className="mt-1 text-muted-foreground">
              Upload recent prescriptions or symptom notes so your care team can review them before your next visit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Medications"
          value={data.activeMedications}
          icon={Pill}
          description="Currently scheduled"
        />
        <MetricCard
          title="Adherence Score"
          value={`${data.adherenceScore}%`}
          icon={TrendingUp}
          description="Last 30 days"
        />
        <MetricCard
          title="Doses Today"
          value={`${data.dosesTakenToday} / ${data.dosesTotalToday}`}
          icon={Clock}
          description="Taken so far"
        />
        <MetricCard
          title="Unresolved Alerts"
          value={data.unresolvedAlerts}
          icon={Bell}
          description="Needs attention"
          variant={data.unresolvedAlerts > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's doses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Doses</CardTitle>
            <CardDescription>Mark each dose as taken or skipped</CardDescription>
          </CardHeader>
          <CardContent>
            <AdherenceChecklist doses={data.todaysDoses ?? []} />
          </CardContent>
        </Card>

        {/* Adherence trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Adherence</CardTitle>
            <CardDescription>Your adherence over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weeklyAdherence && data.weeklyAdherence.length > 0 ? (
              data.weeklyAdherence.map((day) => (
                <div key={day.date} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={
                        day.score >= 80
                          ? "text-green-600"
                          : day.score >= 50
                          ? "text-yellow-600"
                          : "text-destructive"
                      }
                    >
                      {day.score}%
                    </span>
                  </div>
                  <Progress value={day.score} className="h-1.5" />
                </div>
              ))
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No adherence data yet"
                description="Start logging doses to see your weekly trend."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {data.recentAlerts && data.recentAlerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Alerts</CardTitle>
              <CardDescription>Safety alerts for your medications</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/alerts">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id.toString()}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <AlertBadge severity={alert.severity} />
                <div className="min-w-0">
                  <p className="text-sm">{alert.description}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {alert.type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
