import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Invite Required</p>
        <h1>Create Reviewer Access</h1>
        <p>Use the invitation from the BayLine review team to create your account.</p>
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </section>
    </main>
  );
}
