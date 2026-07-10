import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of NetPrep.",
};

const UPDATED = "July 10, 2026";

export default function TermsPage() {
  return (
    <article className="md-content">
      <h1>Terms &amp; Conditions</h1>
      <p>
        <em>Last updated: {UPDATED}</em>
      </p>
      <p>
        These terms govern your use of NetPrep, a study platform operated by DexForge. By creating
        an account you agree to them. If you don&apos;t agree, please don&apos;t use the service.
      </p>

      <h2>The service</h2>
      <p>
        NetPrep provides study tools: curated and AI-generated courses, practice questions,
        flashcards with spaced repetition, and progress analytics. The service is provided free of
        charge today; we may introduce paid tiers in the future with notice.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must provide accurate information and keep your credentials secure.</li>
        <li>You are responsible for activity under your account.</li>
        <li>One person per account; don&apos;t share or resell access.</li>
      </ul>

      <h2>AI-generated content</h2>
      <ul>
        <li>
          Course generation uses <strong>your own AI provider key</strong>. You are responsible
          for the costs it incurs with your provider and for complying with your provider&apos;s
          terms.
        </li>
        <li>
          AI-generated content can be inaccurate. It is a study aid, not professional advice —
          verify anything important against authoritative sources, especially for certification
          exams.
        </li>
        <li>
          You retain rights to courses you generate; you grant us the license needed to store and
          serve them back to you.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t abuse the platform: no attempts to breach security, scrape other users&apos;
        data, farm XP through automation, generate unlawful content, or interfere with the
        service&apos;s operation. We may suspend accounts that do.
      </p>

      <h2>Curated content</h2>
      <p>
        Curated course content is provided for your personal study. Certification names (e.g.
        CCNA) are trademarks of their respective owners; NetPrep is not affiliated with or
        endorsed by them.
      </p>

      <h2>Availability &amp; changes</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties. We aim for high availability
        but don&apos;t guarantee it, and we may change or discontinue features. We are not liable
        for indirect damages; our total liability is limited to the amount you paid us (currently
        zero).
      </p>

      <h2>Termination</h2>
      <p>
        You can stop using NetPrep at any time and request deletion of your data. We may suspend
        or terminate accounts that violate these terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:hello@iamdex.codes">hello@iamdex.codes</a>.
      </p>
    </article>
  );
}
