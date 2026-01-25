import * as React from "react";

import { AuthPage } from "@/components/auth/AuthPage";

export default function SignUpPage() {
  return (
    <React.Suspense fallback={null}>
      <AuthPage mode="signup" />
    </React.Suspense>
  );
}
