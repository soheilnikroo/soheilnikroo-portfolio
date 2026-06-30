"use client";

// Catches errors in the root layout itself. It replaces the entire document, so
// styles are inlined (the app stylesheet / fonts may not be available here). A
// monospace, chunky-bordered "system crash" panel keeps it on-theme.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05040b",
          color: "#ffffff",
          fontFamily: mono,
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: "100%",
            border: "4px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            background: "#0d0b16",
            padding: 32,
            boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "#fca5a5",
              textTransform: "uppercase",
            }}
          >
            System crash
          </div>
          <h1
            style={{ marginTop: 12, fontSize: 34, fontWeight: 900, textShadow: "3px 3px 0 #000" }}
          >
            ! GLITCH !
          </h1>
          <p
            style={{
              marginTop: 14,
              fontSize: 14,
              color: "#a1a1aa",
              maxWidth: "40ch",
              marginInline: "auto",
            }}
          >
            A critical error occurred. Retry to reboot the experience.
          </p>
          {error.digest ? (
            <p style={{ marginTop: 8, fontSize: 12, color: "#71717a" }}>ref: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 26,
              cursor: "pointer",
              borderRadius: 3,
              border: "2px solid #000",
              background: "#6366f1",
              color: "#fff",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: mono,
              boxShadow: "3px 3px 0 #000",
            }}
          >
            ↻ Retry
          </button>
        </div>
      </body>
    </html>
  );
}
