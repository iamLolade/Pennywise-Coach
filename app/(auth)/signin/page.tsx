import * as React from "react";

import { AuthPage } from "@/components/auth/AuthPage";

export default function SignInPage() {
  return (
    <React.Suspense fallback={null}>
      <AuthPage mode="signin" />
    </React.Suspense>
  );
}
