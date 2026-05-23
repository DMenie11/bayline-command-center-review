import { CommandCenter } from "@/components/command-center";
import { requireUserProfile } from "@/lib/access";
import { getReviewSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const { profile } = await requireUserProfile();
    const snapshot = await getReviewSnapshot(profile);
    const serialized = JSON.parse(JSON.stringify(snapshot));
    return <CommandCenter snapshot={serialized} />;
  } catch (error) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Setup Required</p>
          <h1>Shared preview is not connected yet</h1>
          <p>
            The Next.js app is ready, but the review URL needs Clerk and Neon/Postgres environment variables before shared data can load.
          </p>
          <pre>{error instanceof Error ? error.message : "Unknown configuration error"}</pre>
        </section>
      </main>
    );
  }
}
