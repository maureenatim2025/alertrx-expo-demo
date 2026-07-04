"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  patientOnboardingSchema,
  type PatientOnboardingInput,
} from "@/lib/validators/patient.schema";
import { completeOnboardingAction } from "@/actions/patient.actions";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const PREGNANCY_OPTIONS = [
  { value: "not_applicable", label: "Not applicable" },
  { value: "pregnant", label: "Currently pregnant" },
  { value: "breastfeeding", label: "Breastfeeding" },
  { value: "postpartum", label: "Postpartum" },
];

export function OnboardingPatientForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientOnboardingInput>({
    resolver: zodResolver(patientOnboardingSchema),
    defaultValues: {
      gender: "prefer_not_to_say",
      pregnancyStatus: "not_applicable",
    },
  });

  function onSubmit(data: PatientOnboardingInput) {
    startTransition(async () => {
      const result = await completeOnboardingAction(data as Record<string, any>);
      if (result?.error) {
        toast.error(result.error);
      }
      // On success, the action redirects to /dashboard
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            This helps us personalize your care and identify you safely.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Select
              defaultValue="prefer_not_to_say"
              onValueChange={(v) =>
                setValue("gender", v as PatientOnboardingInput["gender"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address (optional)</Label>
          <Input
            id="address"
            type="text"
            placeholder="Sub-county and district, or neighborhood"
            {...register("address")}
          />
        </div>
      </div>

      {/* Medical Information */}
      <div className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Medical Information</h2>
          <p className="text-sm text-muted-foreground">
            Help us flag important safety alerts for you.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="allergies">
            Known Allergies{" "}
            <span className="text-muted-foreground text-xs">(comma-separated)</span>
          </Label>
          <Input
            id="allergies"
            type="text"
            placeholder="e.g. penicillin, latex, peanuts"
            {...register("allergies")}
          />
          {errors.allergies && (
            <p className="text-xs text-destructive">{errors.allergies.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="chronicConditions">
            Chronic Conditions{" "}
            <span className="text-muted-foreground text-xs">(comma-separated)</span>
          </Label>
          <Input
            id="chronicConditions"
            type="text"
            placeholder="e.g. diabetes, hypertension, asthma"
            {...register("chronicConditions")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pregnancyStatus">Pregnancy Status</Label>
          <Select
            defaultValue="not_applicable"
            onValueChange={(v) =>
              setValue(
                "pregnancyStatus",
                v as PatientOnboardingInput["pregnancyStatus"],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger id="pregnancyStatus">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PREGNANCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Emergency Contact (optional)</h2>
          <p className="text-sm text-muted-foreground">
            Who should we contact if there is an urgent health concern?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="emergencyName">Contact Name</Label>
            <Input
              id="emergencyName"
              type="text"
              placeholder="Full name"
              {...register("emergencyContactName")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emergencyPhone">Phone Number</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              placeholder="+256 7XX XXX XXX"
              {...register("emergencyContactPhone")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emergencyRelationship">Relationship</Label>
            <Input
              id="emergencyRelationship"
              type="text"
              placeholder="e.g. Spouse, Parent"
              {...register("emergencyContactRelationship")}
            />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">Your AlertDrugRx ID is yours for life</p>
        <p className="mt-1 text-blue-800">
          After you complete your profile, you will receive a unique lifetime ID that works at any facility. Keep it safe and use it everywhere you receive care.
        </p>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <User className="h-4 w-4" />
        )}
        {isPending ? "Generating ID..." : "Generate My AlertDrugRx ID"}
      </Button>
    </form>
  );
}
