import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

// ============================================
// Mathos Brand Tokens (from theme/tokens/color.ts)
// FINDING-001: Use exact brand colors
// ============================================
const BLUE = "#2196F3";                    // COLOR_BLUE[500] — primary.main
const BLUE_LIGHT = "rgb(229, 243, 252)";   // COLOR_BLUE[100] — background.lightBlue
const BLUE_ALPHA_15 = "rgba(33,150,243,0.15)"; // Spinner/progress track (FINDING-006/007)
const GREEN = "#66BB6A";                   // COLOR_GREEN[500] — success.main
const TEXT_PRIMARY = "rgba(0,0,0,0.87)";   // BLACK_GREY[800] — text.primary
const TEXT_SECONDARY = "rgba(0,0,0,0.6)";  // BLACK_GREY[600] — text.secondary
const TEXT_DISABLED = "rgba(0,0,0,0.38)";  // BLACK_GREY[500] — pending phase labels
const DIVIDER = "rgba(0,0,0,0.20)";       // BLACK_GREY[300] — divider
const BG_PAPER = "#FFFFFF";                // background.paper
const BG_CANVAS = "#FAFAFA";              // FINDING-004: white canvas, not gray

const phases = [
  { label: "Planning search queries..." },
  { label: "Searching the web..." },
  { label: "Analyzing 15 sources..." },
  { label: "Synthesizing report..." },
];

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill={GREEN} />
    <path
      d="M9 12.5L11 14.5L15 10.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spinner: React.FC<{ size?: number; frame: number }> = ({
  size = 16,
  frame,
}) => {
  const rotation = (frame * 8) % 360;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={BLUE_ALPHA_15}
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        stroke={BLUE}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        transform={`rotate(${rotation} 12 12)`}
      />
    </svg>
  );
};

const SearchIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={BLUE}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const SourceLink: React.FC<{
  num: number;
  title: string;
  url: string;
  opacity: number;
}> = ({ num, title, url, opacity }) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: 4,
      marginBottom: 6,
      opacity,
    }}
  >
    <span style={{ fontSize: 12, color: BLUE, fontWeight: 500 }}>[{num}]</span>
    <span style={{ fontSize: 12, color: BLUE }}>
      {title}
    </span>
    <span style={{ fontSize: 10, color: TEXT_SECONDARY, marginLeft: 4 }}>{url}</span>
  </div>
);

export const DeepResearchAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // FINDING-009: Extended timeline (270 frames = 9s at 30fps)
  // 0-15:    Card appears with spring
  // 10-45:   Query types in character by character
  // 45-75:   Phase 1 "Planning" spinner → checkmark
  // 75-105:  Phase 2 "Searching" spinner → checkmark
  // 105-130: Phase 3 "Analyzing" spinner → checkmark
  // 130-155: Phase 4 "Synthesizing" spinner → checkmark
  // 155-170: Progress phases cross-fade out
  // 155-180: Report summary fades in + slides up
  // 180-200: Key findings fade in
  // 200-230: Sources section fades in
  // 230-250: Metadata chips fade in + slide up
  // 250-270: Hold on final state

  // Card entrance
  const cardScale = spring({ frame, fps, from: 0.95, to: 1, durationInFrames: 20 });
  const cardOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Query text typewriter — AP Math topic
  const queryText = "Latest trends and key topics for AP Math test";
  const queryChars = Math.min(
    queryText.length,
    Math.floor(interpolate(frame, [10, 45], [0, queryText.length], { extrapolateRight: "clamp" }))
  );

  // Phase completions
  const getPhaseState = (phaseIndex: number) => {
    const phaseStarts = [45, 75, 105, 130];
    const phaseDurations = [30, 30, 25, 25];
    const start = phaseStarts[phaseIndex];
    const end = start + phaseDurations[phaseIndex];
    if (frame < start) return "pending";
    if (frame < end) return "active";
    return "complete";
  };

  // Progress bar
  const progressWidth = interpolate(frame, [45, 155], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Report content fade (FINDING-009: more breathing room)
  const reportOpacity = interpolate(frame, [155, 180], [0, 1], { extrapolateRight: "clamp" });
  const reportSlide = interpolate(frame, [155, 180], [10, 0], { extrapolateRight: "clamp" });

  // Key findings fade
  const findingsOpacity = interpolate(frame, [180, 200], [0, 1], { extrapolateRight: "clamp" });

  // Sources fade
  const sourcesOpacity = interpolate(frame, [200, 225], [0, 1], { extrapolateRight: "clamp" });

  // Metadata chips
  const chipsOpacity = interpolate(frame, [230, 250], [0, 1], { extrapolateRight: "clamp" });
  const chipsSlide = interpolate(frame, [230, 250], [8, 0], { extrapolateRight: "clamp" });

  // Show progress phases or report
  const showProgress = frame < 170;
  const showReport = frame >= 155;

  return (
    <AbsoluteFill
      style={{
        // FINDING-002: Inter font, FINDING-004: white canvas
        backgroundColor: BG_CANVAS,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Main card */}
      <div
        style={{
          width: width - 40,
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          backgroundColor: BG_PAPER,
          borderRadius: 12,
          border: `1px solid ${DIVIDER}`,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${DIVIDER}`,
            backgroundColor: BG_PAPER,
          }}
        >
          <SearchIcon />
          {/* FINDING-003: 14px header title */}
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>
            Deep Research
          </span>
          {/* FINDING-003: 12px query text */}
          <span
            style={{
              fontSize: 12,
              color: TEXT_SECONDARY,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {queryText.slice(0, queryChars)}
            {queryChars < queryText.length && (
              <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: BLUE }}>
                |
              </span>
            )}
          </span>
        </div>

        {/* Content area */}
        <div style={{ padding: "12px 16px" }}>
          {/* Progress phases */}
          {showProgress && (
            <div
              style={{
                opacity: interpolate(frame, [155, 170], [1, 0], {
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {phases.map((phase, i) => {
                const state = getPhaseState(i);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      opacity: state === "pending" ? 0.35 : 1,
                    }}
                  >
                    {state === "complete" ? (
                      <CheckIcon size={16} />
                    ) : state === "active" ? (
                      <Spinner size={16} frame={frame} />
                    ) : (
                      <div style={{ width: 16, height: 16 }} />
                    )}
                    <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>
                      {phase.label}
                    </span>
                  </div>
                );
              })}
              {/* FINDING-007: faint progress bar track */}
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  backgroundColor: BLUE_ALPHA_15,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressWidth}%`,
                    height: "100%",
                    backgroundColor: BLUE,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          )}

          {/* Report content */}
          {showReport && (
            <div
              style={{
                opacity: reportOpacity,
                transform: `translateY(${reportSlide}px)`,
              }}
            >
              {/* FINDING-010: light blue background tint for report area */}
              <div
                style={{
                  backgroundColor: BLUE_LIGHT,
                  borderRadius: 8,
                  padding: "10px 12px",
                  marginBottom: 10,
                }}
              >
                {/* Summary heading */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: TEXT_PRIMARY,
                    marginBottom: 6,
                  }}
                >
                  Summary
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: TEXT_SECONDARY,
                  }}
                >
                  The 2026 AP Calculus and AP Statistics exams are shifting toward
                  application-based questions emphasizing real-world modeling.
                  Colleges increasingly rely on AP Math scores for placement,
                  with Calculus BC seeing the highest growth in enrollment{" "}
                  <span style={{ color: BLUE, fontWeight: 500 }}>[1][2]</span>.
                </div>
              </div>

              {/* Key Findings — FINDING-010: left border accent */}
              <div
                style={{
                  opacity: findingsOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: TEXT_PRIMARY,
                    marginBottom: 6,
                  }}
                >
                  Key Findings
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: TEXT_SECONDARY,
                    lineHeight: 1.6,
                    marginBottom: 10,
                    borderLeft: `3px solid ${BLUE}`,
                    paddingLeft: 10,
                  }}
                >
                  <div style={{ marginBottom: 3 }}>
                    {"\u2022"} Parametric equations & polar curves are the #1 tested topic{" "}
                    <span style={{ color: BLUE, fontWeight: 500 }}>[1]</span>
                  </div>
                  <div style={{ marginBottom: 3 }}>
                    {"\u2022"} AP Statistics adding inference for regression slopes{" "}
                    <span style={{ color: BLUE, fontWeight: 500 }}>[3]</span>
                  </div>
                  <div>
                    {"\u2022"} Calculator-active sections now 60% of score{" "}
                    <span style={{ color: BLUE, fontWeight: 500 }}>[2]</span>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div
                style={{
                  opacity: sourcesOpacity,
                  borderTop: `1px solid ${DIVIDER}`,
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: TEXT_PRIMARY,
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>Sources</span>
                  <span style={{ fontSize: 10, color: TEXT_SECONDARY, fontWeight: 400 }}>
                    (15)
                  </span>
                </div>
                <SourceLink num={1} title="College Board AP Calculus Updates 2026" url="collegeboard.org" opacity={sourcesOpacity} />
                <SourceLink num={2} title="AP Math Score Trends & Analysis" url="nytimes.com" opacity={sourcesOpacity} />
                <SourceLink num={3} title="AP Statistics Curriculum Changes" url="apcentral.org" opacity={sourcesOpacity} />
              </div>

              {/* Metadata chips */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 10,
                  opacity: chipsOpacity,
                  transform: `translateY(${chipsSlide}px)`,
                }}
              >
                {["2 rounds", "5 queries", "15 sources"].map((label) => (
                  <div
                    key={label}
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: TEXT_SECONDARY,
                      padding: "3px 8px",
                      borderRadius: 10,
                      border: `1px solid ${DIVIDER}`,
                      backgroundColor: BG_PAPER,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FINDING-008: Mathos branding watermark */}
        <div
          style={{
            padding: "4px 16px 8px",
            display: "flex",
            justifyContent: "flex-end",
            opacity: 0.4,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 500, color: TEXT_SECONDARY }}>
            Mathos AI
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
