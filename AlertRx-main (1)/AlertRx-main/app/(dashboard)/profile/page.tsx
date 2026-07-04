import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPatientProfile } from "@/lib/services/patients.service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User, Phone, Mail, MapPin, AlertCircle, Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "My Profile" };

export default async function PatientProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") redirect("/login");

  const result = await getPatientProfile(session.user.id);
  const profile = result.profile;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Your personal, medical, and account information.
        </p>
      </div>

      {/* AlertDrugRx ID Card */}
      {profile?.patientId && (
        <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-teal-600">Your Lifetime ID</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                AlertDrugRx Lifetime ID
              </p>
              <p className="text-3xl font-mono font-bold text-teal-700 tracking-wider">
                {profile.patientId}
              </p>
              <p className="text-sm text-muted-foreground">
                Works at any facility. Your records follow this ID.
              </p>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-start gap-2 text-teal-900">
                <span className="text-lg">✓</span>
                <span>
                  <strong>Works across all facilities:</strong> Any facility ID you receive gets linked to this one.
                </span>
              </div>
              <div className="flex items-start gap-2 text-teal-900">
                <span className="text-lg">✓</span>
                <span>
                  <strong>Full health history:</strong> From your first visit onward — all in one place.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">{session.user.name}</p>
            </div>
            {profile?.dateOfBirth && (
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {format(new Date(profile.dateOfBirth), "MMMM d, yyyy")}
                </p>
              </div>
            )}
            {profile?.gender && (
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">
                  {profile.gender.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {profile?.address && (
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{profile.address}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{(result.user as any)?.phone ?? "No phone on file"}</span>
            </div>
            {session.user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{session.user.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Known Allergies</p>
            {profile?.allergies && profile.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">None recorded</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Chronic Conditions
            </p>
            {profile?.chronicConditions && profile.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.chronicConditions.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">None recorded</p>
            )}
          </div>

          {profile?.pregnancyStatus &&
            profile.pregnancyStatus !== "not_applicable" && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Pregnancy Status
                </p>
                <Badge variant="outline" className="capitalize text-xs">
                  {profile.pregnancyStatus.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {profile?.emergencyContact?.name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{profile.emergencyContact.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{profile.emergencyContact.phone}</span>
            </div>
            {profile.emergencyContact.relationship && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Relationship</span>
                <span>{profile.emergencyContact.relationship}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Family Accounts / Household Placeholder */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 flex items-center gap-2">
            <User className="h-4 w-4" />
            Your Household
          </CardTitle>
          <CardDescription>Family members on your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-blue-300 bg-white p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{profile?.patientId}</p>
            </div>
            <Badge variant="outline" className="text-xs">You</Badge>
          </div>
          <p className="text-xs text-blue-900">
            Register family members to create linked household accounts. Each person gets their own AlertDrugRx ID that shares the family's health context.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
