import { ImageResponse } from "next/og";

export const alt = "NetPrep — The Preparation Operating System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        <div
          style={{
            position: "absolute",
            top: -150,
            left: 200,
            width: 600,
            height: 400,
            borderRadius: 9999,
            background: "rgba(43,143,255,0.22)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: 150,
            width: 500,
            height: 350,
            borderRadius: 9999,
            background: "rgba(255,122,26,0.18)",
            filter: "blur(120px)",
          }}
        />

        {/* Bolt mark */}
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke="#5aa2ff"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -4,
            marginTop: 28,
          }}
        >
          <span style={{ color: "#fafafa" }}>Net</span>
          <span style={{ color: "#2b8fff" }}>Prep</span>
        </div>

        <div
          style={{
            fontSize: 34,
            color: "#a1a1aa",
            marginTop: 12,
          }}
        >
          The Preparation Operating System
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 44,
            fontSize: 20,
            color: "#71717a",
          }}
        >
          {["AI Courses", "MCQ Practice", "Spaced Repetition", "Streaks & XP"].map((t) => (
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
