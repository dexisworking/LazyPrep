import { ImageResponse } from "next/og";

export const alt = "NetPrep — Prepare Smarter. Pass with Confidence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#2E9CE8";
const ORANGE = "#F2822E";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow accents */}
        <div style={{ position: "absolute", top: -160, left: 180, width: 620, height: 420, borderRadius: 9999, background: "rgba(46,156,232,0.22)", filter: "blur(130px)" }} />
        <div style={{ position: "absolute", bottom: -160, right: 140, width: 520, height: 380, borderRadius: 9999, background: "rgba(242,130,46,0.18)", filter: "blur(130px)" }} />

        {/* Bolt mark (hollow, gradient) */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="og-bolt" x1="6" y1="4" x2="17" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor={BLUE} />
              <stop offset="0.45" stopColor="#3FA3EE" />
              <stop offset="1" stopColor={ORANGE} />
            </linearGradient>
          </defs>
          <path
            d="M13.5 2.5 L4.5 13.5 L10.5 13.5 L10 21.5 L19.5 10.5 L13.5 10.5 Z"
            stroke="url(#og-bolt)"
            strokeWidth="2.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Wordmark */}
        <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: -4, marginTop: 24 }}>
          <span style={{ color: "#fafafa" }}>Net</span>
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${BLUE}, ${ORANGE})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Prep
          </span>
        </div>

        {/* Tagline */}
        <div style={{ display: "flex", fontSize: 34, marginTop: 14, color: "#a1a1aa" }}>
          <span>Prepare Smarter.&nbsp;</span>
          <span style={{ color: BLUE }}>Pass</span>
          <span>&nbsp;with&nbsp;</span>
          <span style={{ color: ORANGE }}>Confidence.</span>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 14, marginTop: 46, fontSize: 20, color: "#8a8a94" }}>
          {["AI Tutor", "Adaptive Courses", "Spaced Repetition", "Mock Tests"].map((t) => (
            <div
              key={t}
              style={{
                border: "1px solid #26262e",
                borderRadius: 9999,
                padding: "8px 22px",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
