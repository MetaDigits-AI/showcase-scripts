import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Easing,
  staticFile,
} from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

// ============================================
// Mathos Brand Tokens (from theme/tokens/color.ts)
// ============================================
const BLUE = "#2196F3";
const BLUE_LIGHT = "rgb(229, 243, 252)";
const BLUE_ALPHA_15 = "rgba(33,150,243,0.15)";
const GREEN = "#66BB6A";
const TEXT_PRIMARY = "rgba(0,0,0,0.87)";
const TEXT_SECONDARY = "rgba(0,0,0,0.6)";
const DIVIDER = "rgba(0,0,0,0.20)";
const BG_PAPER = "#FFFFFF";
const BG_CANVAS = "#FAFAFA";

const COMPACT_HEIGHT = 170;
const FULL_HEIGHT = 340;

const phases = [
  { label: "Planning search queries..." },
  { label: "Searching the web..." },
  { label: "Analyzing 34 sources..." },
  { label: "Synthesizing report..." },
];

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill={GREEN} />
    <path d="M9 12.5L11 14.5L15 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner: React.FC<{ size?: number; frame: number }> = ({ size = 16, frame }) => {
  const rotation = (frame * 8) % 360;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke={BLUE_ALPHA_15} strokeWidth="3" fill="none" />
      <path d="M12 2 A10 10 0 0 1 22 12" stroke={BLUE} strokeWidth="3" fill="none" strokeLinecap="round" transform={`rotate(${rotation} 12 12)`} />
    </svg>
  );
};

const SearchIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={BLUE}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const Cite: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: BLUE, fontWeight: 500, fontSize: 11 }}>{children}</span>
);

const SourceLink: React.FC<{ num: number; title: string; url: string }> = ({ num, title, url }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 5 }}>
    <span style={{ fontSize: 11, color: BLUE, fontWeight: 500 }}>[{num}]</span>
    <span style={{ fontSize: 11, color: BLUE }}>{title}</span>
    <span style={{ fontSize: 10, color: TEXT_SECONDARY, marginLeft: 4 }}>{url}</span>
  </div>
);

export const DeepResearchAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // ============================================
  // Timeline (356 frames = ~11.9s at 30fps)
  //
  // PROGRESS PHASE: 1.5x faster than v6 (snappy)
  //   0-8:     Card fades in (compact)
  //   8-35:    Query types in
  //   35-55:   Phase 1 spinner → check
  //   55-75:   Phase 2 spinner → check
  //   75-95:   Phase 3 spinner → check
  //   95-115:  Phase 4 spinner → check
  //   115-130: Progress cross-fades out + card expands
  //
  // REPORT PHASE: same 0.7x leisurely pace as v6
  //   120-148: Report summary fades in
  //   148-178: Key Topics fade in
  //   178-206: Recommended Practice fades in
  //   206-235: Sources fade in
  //   235-257: Chips fade in
  //   178-330: Slow scroll up
  //   330-356: Hold
  // ============================================

  const cardScale = spring({ frame, fps, from: 0.95, to: 1, durationInFrames: 15 });
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Card height: compact during progress, expands smoothly when report appears
  const cardHeight = interpolate(frame, [110, 148], [COMPACT_HEIGHT, FULL_HEIGHT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const queryText = "Latest trends and key topics for AP Math test";
  const queryChars = Math.min(
    queryText.length,
    Math.floor(interpolate(frame, [8, 35], [0, queryText.length], { extrapolateRight: "clamp" }))
  );

  // Progress phases — snappy 20-frame durations
  const getPhaseState = (phaseIndex: number) => {
    const phaseStarts = [35, 55, 75, 95];
    const phaseDurations = [20, 20, 20, 20];
    const start = phaseStarts[phaseIndex];
    const end = start + phaseDurations[phaseIndex];
    if (frame < start) return "pending";
    if (frame < end) return "active";
    return "complete";
  };

  const progressWidth = interpolate(frame, [35, 115], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Report phase — leisurely 0.7x pace
  const reportOpacity = interpolate(frame, [120, 148], [0, 1], { extrapolateRight: "clamp" });
  const topicsOpacity = interpolate(frame, [148, 178], [0, 1], { extrapolateRight: "clamp" });
  const practiceOpacity = interpolate(frame, [178, 206], [0, 1], { extrapolateRight: "clamp" });
  const sourcesOpacity = interpolate(frame, [206, 235], [0, 1], { extrapolateRight: "clamp" });
  const chipsOpacity = interpolate(frame, [235, 257], [0, 1], { extrapolateRight: "clamp" });

  // Slow scroll to reveal full report
  const scrollY = interpolate(frame, [178, 330], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const showProgress = frame < 135;
  const showReport = frame >= 120;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_CANVAS,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          width: width - 40,
          height: cardHeight,
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          backgroundColor: BG_PAPER,
          borderRadius: 12,
          border: `1px solid ${DIVIDER}`,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
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
            flexShrink: 0,
          }}
        >
          <SearchIcon />
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>
            Deep Research
          </span>
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
              <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: BLUE }}>|</span>
            )}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              padding: "12px 16px",
              transform: showReport ? `translateY(-${scrollY}px)` : "none",
            }}
          >
            {/* Progress phases */}
            {showProgress && (
              <div style={{ opacity: interpolate(frame, [115, 135], [1, 0], { extrapolateRight: "clamp" }) }}>
                {phases.map((phase, i) => {
                  const state = getPhaseState(i);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, opacity: state === "pending" ? 0.35 : 1 }}>
                      {state === "complete" ? <CheckIcon size={16} /> : state === "active" ? <Spinner size={16} frame={frame} /> : <div style={{ width: 16, height: 16 }} />}
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>{phase.label}</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, height: 4, backgroundColor: BLUE_ALPHA_15, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${progressWidth}%`, height: "100%", backgroundColor: BLUE, borderRadius: 2 }} />
                </div>
              </div>
            )}

            {/* REPORT */}
            {showReport && (
              <div style={{ opacity: reportOpacity, transform: `translateY(${interpolate(frame, [120, 148], [10, 0], { extrapolateRight: "clamp" })}px)` }}>

                {/* Summary */}
                <div style={{ backgroundColor: BLUE_LIGHT, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>Summary</div>
                  <div style={{ fontSize: 11, lineHeight: 1.55, color: TEXT_SECONDARY }}>
                    The 2026 AP Calculus AB/BC and AP Statistics exams emphasize
                    application-based reasoning over rote computation. College Board
                    reports a 12% increase in BC enrollment <Cite>[1]</Cite>. Below
                    are the highest-weight topics and recommended practice sets.
                  </div>
                </div>

                {/* Key Topics */}
                <div style={{ opacity: topicsOpacity }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>Key Topics by Exam Weight</div>
                  <div style={{ fontSize: 11, color: TEXT_SECONDARY, lineHeight: 1.55, marginBottom: 10, borderLeft: `3px solid ${BLUE}`, paddingLeft: 10 }}>
                    <div style={{ marginBottom: 2 }}>
                      <span style={{ fontWeight: 500, color: TEXT_PRIMARY }}>Calc AB:</span>{" "}
                      Limits & continuity (10-12%), derivatives of composite functions, FTC Parts I & II, related rates, optimization <Cite>[1][2]</Cite>
                    </div>
                    <div style={{ marginBottom: 2 }}>
                      <span style={{ fontWeight: 500, color: TEXT_PRIMARY }}>Calc BC:</span>{" "}
                      Parametric/polar/vector functions, Taylor & Maclaurin series, convergence tests (ratio, comparison), Euler's method <Cite>[1][3]</Cite>
                    </div>
                    <div>
                      <span style={{ fontWeight: 500, color: TEXT_PRIMARY }}>Statistics:</span>{" "}
                      Inference for regression slopes (new), chi-square tests, experimental design, probability distributions <Cite>[4]</Cite>
                    </div>
                  </div>
                </div>

                {/* Recommended Practice */}
                <div style={{ opacity: practiceOpacity }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>Recommended Practice Sets</div>
                  <div style={{ fontSize: 11, color: TEXT_SECONDARY, lineHeight: 1.55, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                      <span style={{ color: BLUE, fontWeight: 600, flexShrink: 0 }}>01</span>
                      <span>FRQ #2 & #5 from 2024-2025 released exams — tests FTC application + series convergence <Cite>[2]</Cite></span>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                      <span style={{ color: BLUE, fontWeight: 600, flexShrink: 0 }}>02</span>
                      <span>AP Classroom Unit 8 & 10 progress checks — parametric equations, polar area <Cite>[1]</Cite></span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ color: BLUE, fontWeight: 600, flexShrink: 0 }}>03</span>
                      <span>Khan Academy "AP Calc BC: Series" module — 42 practice problems with worked solutions <Cite>[5]</Cite></span>
                    </div>
                  </div>
                </div>

                {/* Sources */}
                <div style={{ opacity: sourcesOpacity, borderTop: `1px solid ${DIVIDER}`, paddingTop: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: TEXT_PRIMARY, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>Sources</span>
                    <span style={{ fontSize: 10, color: TEXT_SECONDARY, fontWeight: 400 }}>(34)</span>
                  </div>
                  <SourceLink num={1} title="AP Calculus Course Updates 2026" url="collegeboard.org" />
                  <SourceLink num={2} title="2025 AP Calc FRQ Analysis" url="apcentral.org" />
                  <SourceLink num={3} title="BC Series & Convergence Guide" url="khanacademy.org" />
                  <SourceLink num={4} title="AP Statistics Curriculum Changes" url="collegeboard.org" />
                  <SourceLink num={5} title="AP Calc Practice Problem Sets" url="khanacademy.org" />
                </div>

                {/* Metadata chips */}
                <div style={{ display: "flex", gap: 6, marginTop: 10, opacity: chipsOpacity, transform: `translateY(${interpolate(frame, [235, 257], [6, 0], { extrapolateRight: "clamp" })}px)` }}>
                  {["2 rounds", "8 queries", "34 sources"].map((label) => (
                    <div key={label} style={{ fontSize: 10, fontWeight: 500, color: TEXT_SECONDARY, padding: "3px 8px", borderRadius: 10, border: `1px solid ${DIVIDER}`, backgroundColor: BG_PAPER }}>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Mathos full logo watermark */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, opacity: 0.6 }}>
                  <Img src={staticFile("mathos-logo-full.png")} style={{ height: 16 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
