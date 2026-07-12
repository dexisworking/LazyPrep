import "server-only";
import { Resend } from "resend";

/** Email is enabled only when a Resend API key is configured. */
export const emailEnabled = Boolean(process.env.RESEND_API_KEY);

const resend = emailEnabled ? new Resend(process.env.RESEND_API_KEY) : null;

// For production, verify a domain in Resend and set EMAIL_FROM to an address on
// it (e.g. "LazyPrep <noreply@lazyprep.iamdex.codes>"). The default onboarding
// sender only delivers to your own Resend account email.
const FROM = process.env.EMAIL_FROM || "LazyPrep <onboarding@resend.dev>";

/** Shared branded email shell. `bodyHtml` is trusted (built here, not user input). */
function emailShell(heading: string, bodyHtml: string): string {
  return `
  <div style="background:#0a0a0f;padding:40px 0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#12121a;border:1px solid #23232f;border-radius:16px;padding:32px;color:#e7e7ee;">
      <div style="font-size:22px;font-weight:700;margin-bottom:8px;">
        Lazy<span style="color:#3b82f6;">Prep</span>
      </div>
      <h1 style="font-size:20px;margin:16px 0 8px;color:#ffffff;">${heading}</h1>
      ${bodyHtml}
    </div>
  </div>`;
}

function ctaButton(url: string, label: string): string {
  return `
    <a href="${url}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;">
      ${label}
    </a>
    <p style="color:#71718a;font-size:13px;line-height:1.6;margin:24px 0 0;">
      If the button doesn't work, copy this link into your browser:<br/>
      <a href="${url}" style="color:#3b82f6;word-break:break-all;">${url}</a>
    </p>`;
}

function verificationEmailHtml(name: string, url: string): string {
  const safeName = name ? name.replace(/[<>]/g, "") : "there";
  return emailShell(
    "Verify your email",
    `<p style="color:#a1a1b3;line-height:1.6;margin:0 0 24px;">
        Hi ${safeName}, welcome to LazyPrep! Confirm your email address to activate your account and start preparing.
      </p>
      ${ctaButton(url, "Verify email")}
      <p style="color:#71718a;font-size:12px;margin:24px 0 0;">
        If you didn't create a LazyPrep account, you can ignore this email.
      </p>`,
  );
}

function resetPasswordEmailHtml(name: string, url: string): string {
  const safeName = name ? name.replace(/[<>]/g, "") : "there";
  return emailShell(
    "Reset your password",
    `<p style="color:#a1a1b3;line-height:1.6;margin:0 0 24px;">
        Hi ${safeName}, we received a request to reset your LazyPrep password. Click below to choose a new one. This link expires in 1 hour.
      </p>
      ${ctaButton(url, "Reset password")}
      <p style="color:#71718a;font-size:12px;margin:24px 0 0;">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>`,
  );
}

export async function sendVerificationEmail(to: string, name: string, url: string) {
  if (!resend) return; // No-op when email isn't configured.
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your LazyPrep email",
    html: verificationEmailHtml(name, url),
  });
}

export async function sendResetPasswordEmail(to: string, name: string, url: string) {
  if (!resend) return; // No-op when email isn't configured.
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your LazyPrep password",
    html: resetPasswordEmailHtml(name, url),
  });
}
