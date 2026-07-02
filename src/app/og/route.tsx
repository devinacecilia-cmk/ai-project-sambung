import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

// const metrics = [
//   { label: "Latency", value: "18", unit: "ms" },
//   { label: "Download", value: "482", unit: "Mbps" },
//   { label: "Upload", value: "96", unit: "Mbps" },
// ];

export function GET() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0b1326",
        color: "#dae2fd",
        display: "flex",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: 56,
        width: "100%",
      }}
    >
      {/* Ambient glow accents matching the app's login/dashboard theme */}
      <div
        style={{
          background: "#adc6ff",
          borderRadius: "50%",
          filter: "blur(180px)",
          height: 560,
          left: -160,
          opacity: 0.18,
          position: "absolute",
          top: -200,
          width: 560,
        }}
      />
      <div
        style={{
          background: "#3131c0",
          borderRadius: "50%",
          filter: "blur(180px)",
          height: 640,
          opacity: 0.22,
          position: "absolute",
          right: -180,
          bottom: -240,
          width: 640,
        }}
      />

      <div
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.55)",
          backgroundImage:
            "linear-gradient(rgba(173,198,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(173,198,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 28,
          boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          padding: "64px 72px",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Status pill */}
        <div
          style={{
            alignItems: "center",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            borderRadius: 999,
            color: "#34d399",
            display: "flex",
            fontSize: 18,
            fontWeight: 800,
            gap: 12,
            letterSpacing: "0.22em",
            padding: "14px 24px",
            position: "relative",
            textTransform: "uppercase",
            width: "max-content",
          }}
        >
          <div
            style={{
              background: "#34d399",
              borderRadius: "50%",
              height: 12,
              width: 12,
            }}
          />
          Systems Operational
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginTop: 40,
            position: "relative",
          }}
        >
          <p
            style={{
              color: "#adc6ff",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "0.4em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Sambung
          </p>
          <h1
            style={{
              color: "#f5f7ff",
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 0.94,
              margin: 0,
              maxWidth: 900,
            }}
          >
            Network Health Monitor
          </h1>
          <p
            style={{
              color: "#8c909f",
              fontSize: 30,
              lineHeight: 1.4,
              margin: 0,
              maxWidth: 900,
            }}
          >
            Real-time speed tests, latency checks, and connection diagnostics —
            all in one dashboard.
          </p>
        </div>

        {/* Live metric strip */}
        <div
          style={{
            bottom: 52,
            display: "flex",
            gap: 20,
            left: 72,
            position: "absolute",
          }}
        >
          {/* {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                alignItems: "baseline",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(173,198,255,0.15)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "18px 26px",
              }}
            >
              <span
                style={{
                  color: "#8c909f",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {metric.label}
              </span>
              <span style={{ alignItems: "baseline", display: "flex", gap: 6 }}>
                <span
                  style={{
                    color: "#dae2fd",
                    fontSize: 40,
                    fontWeight: 900,
                  }}
                >
                  {metric.value}
                </span>
                <span style={{ color: "#adc6ff", fontSize: 20, fontWeight: 700 }}>
                  {metric.unit}
                </span>
              </span>
            </div>
          ))} */}
        </div>
      </div>
    </div>,
    size,
  );
}
