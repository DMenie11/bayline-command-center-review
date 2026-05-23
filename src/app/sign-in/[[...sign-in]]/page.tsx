import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Protected Review Preview</p>
        <h1>BayLine Command Center</h1>
        <p>Sign in with your reviewer invite to access the shared WMS/TMS preview.</p>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </section>
    </main>
  );
}
