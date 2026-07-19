import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How LazyPrep collects, uses, and protects your data.",
};

const UPDATED = "July 19, 2026";

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
        <li>
          <strong>Diagnostics</strong> — when something breaks, we record the error, the page it
          happened on, and basic device and browser details so we can fix it. A small sample of
          requests is also timed to find slow pages. This is error monitoring, not analytics: we
          don&apos;t build profiles, track you across sites, or measure engagement.
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
        (hosting), Neon (PostgreSQL database), Resend (transactional email such as verification
        messages), and Sentry (error and performance monitoring). If you use AI course
        generation, your prompts are sent to the AI provider you configured (e.g. OpenRouter)
        under your own key and their terms.
      </p>

      <h2>Cookies</h2>
      <p>
        We use only essential cookies: a session cookie to keep you signed in. No analytics or
        marketing cookies.
      </p>

      <h2>The Android app</h2>
      <p>
        The LazyPrep Android app (<code>com.lazyprep.app</code>, distributed through Google Play)
        is a Trusted Web Activity: a thin native shell around this same website. It collects no
        data beyond what the web app collects, contains no advertising or third-party analytics
        SDKs, and reads nothing from your device — no contacts, location, photos, or files.
      </p>
      <p>
        The app requests one optional permission, <strong>notifications</strong>, used solely to
        deliver the study reminders you enable yourself. You can decline it at install time or
        revoke it later in Android Settings; the rest of the app works unchanged either way. The
        app signs you in through the same session as your browser, so signing out in one place
        signs you out in both.
      </p>

      <h2>Data retention &amp; deletion</h2>
      <p>
        Your data is kept while your account is active. Deleting a course you created removes its
        content.
      </p>
      <p>
        <strong>You can delete your account yourself at any time</strong> — open{" "}
        <strong>Settings → Delete account</strong> in the app (web or Android). This permanently
        removes your profile, study history, progress, flashcard and practice records, and any
        stored AI provider key. The deletion is immediate and cannot be undone; we keep no shadow
        copy.
      </p>
      <p>
        If you&apos;d rather we did it, or you can&apos;t sign in, email{" "}
        <a href="mailto:hello@iamdex.codes">hello@iamdex.codes</a> and we&apos;ll process it
        promptly. Encrypted database backups held by our hosting provider may retain residual
        copies for a limited period after deletion before they are overwritten in the normal
        backup cycle.
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
