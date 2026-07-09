import "server-only";
import { Resend } from "resend";

/** Email is enabled only when a Resend API key is configured. */
export const emailEnabled = Boolean(process.env.RESEND_API_KEY);

const resend = emailEnabled ? new Resend(process.env.RESEND_API_KEY) : null;

// For production, verify a domain in Resend and set EMAIL_FROM to an address on
// it (e.g. "NetPrep <noreply@netprep.iamdex.codes>"). The default onboarding
// sender only delivers to your own Resend account email.
const FROM = process.env.EMAIL_FROM || "NetPrep <onboarding@resend.dev>";

function verificationEmailHtml(name: string, url: string): string {
  const safeName = name ? name.replace(/[<>]/g, "") : "there";
  return `
  <div style="background:#0a0a0f;padding:40px 0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#12121a;border:1px solid #23232f;border-radius:16px;padding:32px;color:#e7e7ee;">
      <div style="font-size:22px;font-weight:700;margin-bottom:8px;">
        Net<span style="color:#3b82f6;">Prep</span>
      </div>
      <h1 style="font-size:20px;margin:16px 0 8px;color:#ffffff;">Verify your email</h1>
      <p style="color:#a1a1b3;line-height:1.6;margin:0 0 24px;">
        Hi ${safeName}, welcome to NetPrep! Confirm your email address to activate your account and start preparing.
      </p>
      <a href="${url}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;">
        Verify email
      </a>
      <p style="color:#71718a;font-size:13px;line-height:1.6;margin:24px 0 0;">
        If the button doesn't work, copy this link into your browser:<br/>
        <a href="${url}" style="color:#3b82f6;word-break:break-all;">${url}</a>
      </p>
      <p style="color:#71718a;font-size:12px;margin:24px 0 0;">
        If you didn't create a NetPrep account, you can ignore this email.
      </p>
    </div>
  </div>`;
}

export async function sendVerificationEmail(to: string, name: string, url: string) {
  if (!resend) return; // No-op when email isn't configured.
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your NetPrep email",
    html: verificationEmailHtml(name, url),
  });
}
