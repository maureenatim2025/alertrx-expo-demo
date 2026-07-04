import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getProviderDashboardData } from "@/lib/services/dashboard.service";
import { MetricCard } from "@/components/shared/metric-card";
import { PatientSummaryCard } from "@/components/shared/patient-summary-card";
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
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Bell, Search, Plus, AlertTriangle, Clock, Pill } from "lucide-react";

export const metadata: Metadata = { title: "Provider Dashboard" };

export default async function ProviderDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "provider") redirect("/login");

  const data = await getProviderDashboardData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, Dr. {session.user.name?.split(" ").slice(-1)[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Patient alerts, prescriptions, and care coordination.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/provider/search">
              <Search className="h-4 w-4" />
              Find Patient
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/provider/prescriptions/new">
              <Plus className="h-4 w-4" />
              New Prescription
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="My Patients"
          value={data.totalPatients}
          icon={Users}
          description="Under your care"
        />
        <MetricCard
          title="Prescriptions"
          value={data.totalPrescriptions}
          icon={FileText}
          description="All time"
        />
        <MetricCard
          title="Pending Alerts"
          value={data.pendingAlerts}
          icon={Bell}
          description="Action needed"
          variant={data.pendingAlerts > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Low Adherence"
          value={data.lowAdherenceCount}
          icon={AlertTriangle}
          description="Below 70%"
          variant={data.lowAdherenceCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Alerts */}
        {data.recentAlerts && data.recentAlerts.length > 0 && (
          <Card className="lg:col-span-2 border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-red-900 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Urgent Alerts
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    Requires your immediate attention
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-red-600 hover:text-red-700">
                  <Link href="/provider/alerts">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert._id.toString()}
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    <AlertBadge severity={alert.severity} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.description}</p>
                    <p className="text-xs text-gray-600 capitalize mt-1">
                      {alert.type.replace(/_/g, " ")} • Patient: {alert.patientName ?? "Unknown"}
                    </p>
                  </div>
                  {alert.createdAt && (
                    <div className="flex-shrink-0 text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Patients</CardTitle>
              <CardDescription>Last updated activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provider/patients">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentPatients && data.recentPatients.length > 0 ? (
              data.recentPatients.slice(0, 5).map((patient) => (
                <Link
                  key={patient.id}
                  href={`/provider/patients/${patient.id}`}
                  className="block group"
                >
                  <div className="rounded-lg border p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {patient.patientId}
                        </p>
                      </div>
                      {patient.unresolvedAlerts > 0 && (
                        <Badge variant="destructive" className="text-xs whitespace-nowrap">
                          {patient.unresolvedAlerts} alert
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Pill className="h-3 w-3" />
                        {patient.activeMedications} meds
                      </span>
                      {patient.adherenceScore !== undefined && (
                        <span className={`flex items-center gap-1 font-medium ${patient.adherenceScore >= 70 ? "text-green-600" : "text-orange-600"}`}>
                          {patient.adherenceScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                icon={Users}
                title="No patients yet"
                description="Search for a patient to get started."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/provider/search">Find Patient</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

