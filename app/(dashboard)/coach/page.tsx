"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CoachChat } from "@/components/coach/CoachChat";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/user";
import type { UserProfile } from "@/types";

export default function CoachPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          router.push("/signin?redirect=/coach");
          return;
        }

        // Get user profile from Supabase
        const profile = await getUserProfile();
        if (!profile || !profile.onboardingComplete) {
          router.push("/onboarding");
          return;
        }

        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <CoachChat userProfile={userProfile} />
    </div>
  );
}
