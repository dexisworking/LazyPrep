import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How LazyPrep collects, uses, and protects your data.",
};

const UPDATED = "July 10, 2026";

export default function PrivacyPage() {
  return (
    <article className="md-content">
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: {UPDATED}</em>
      </p>
      <p>
        LazyPrep (&quot;we&quot;, &quot;us&quot;) is a study platform operated by DexForge. This
        policy explains what we collect, why, and the choices you have. The short version: we
        collect only what the product needs, we don&apos;t sell data, and we don&apos;t run ads or
        third-party tracking.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your name, email address, and (if you sign in with
          Google) your Google account ID and profile picture. Passwords are hashed; we never see
          or store them in plain text.
        </li>
        <li>
          <strong>Study activity</strong> — courses you enroll in, lessons you complete, practice
          answers, flashcard reviews, XP, streaks, and daily study sessions. This is the core of
          the product: it powers your progress tracking, analytics, and spaced repetition.
        </li>
        <li>
          <strong>AI provider keys (optional)</strong> — if you connect your own AI key to
          generate courses, it is encrypted at rest with AES-256-GCM before it touches the
          database, is used only to call your chosen AI provider on your behalf, and is never
          returned to any client after saving. You can delete it at any time in Settings.
        </li>
        <li>
          <strong>Timezone</strong> — detected from your browser so streaks and study days follow
          your local calendar.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>No selling or renting of personal data, ever.</li>
        <li>No advertising, ad networks, or cross-site tracking.</li>
        <li>No reading of your AI-generated course content for any purpose other than serving it back to you.</li>
      </ul>

      <h2>Where your data lives</h2>
      <p>
        LazyPrep runs on trusted infrastructure providers acting as data processors: Vercel
        (hosting), Neon (PostgreSQL database), and Resend (transactional email such as
        verification messages). If you use AI course generation, your prompts are sent to the AI
        provider you configured (e.g. OpenRouter) under your own key and their terms.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only essential cookies: a session cookie to keep you signed in. No analytics or
        marketing cookies.
      </p>

      <h2>Data retention &amp; deletion</h2>
      <p>
        Your data is kept while your account is active. Deleting a course you created removes its
        content. To delete your account and all associated data, email{" "}
        <a href="mailto:hello@iamdex.codes">hello@iamdex.codes</a> and we&apos;ll process it
        promptly.
      </p>

      <h2>Security</h2>
      <p>
        Traffic is encrypted with TLS. Passwords are hashed, sessions are signed, and AI keys are
        encrypted with AES-256-GCM using a server-side key. No system is perfectly secure, but we
        follow current best practices.
      </p>

      <h2>Children</h2>
      <p>LazyPrep is not directed at children under 13 and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>
        We&apos;ll update this page when the policy changes and adjust the date above. Material
        changes will be announced in the app.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Reach us at <a href="mailto:hello@iamdex.codes">hello@iamdex.codes</a>.
      </p>
    </article>
  );
}
