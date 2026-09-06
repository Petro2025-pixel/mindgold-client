import React, { useState } from "react";
import ParticleBackground from "./BackgroundCanvas";
import CircuitBackground from "./BackgroundCanvas2";

/**
 * BackgroundManager Component.
 * Manages state and interactive toggling between dynamic canvas background visualizers
 * (Particle Network vs. Procedural Circuit Board).
 *
 * @component
 * @returns {JSX.Element} The active background canvas along with the toggle controller button.
 */
export default function BackgroundManager() {
  /**
   * Active background theme identifier.
   * @type {['dots' | 'circuit', React.Dispatch<React.SetStateAction<'dots' | 'circuit'>>]}
   */
  const [activeBg, setActiveBg] = useState("dots");

  /**
   * Toggles active canvas background theme between 'dots' and 'circuit'.
   *
   * @function toggleBackground
   * @returns {void}
   */
  const toggleBackground = () => {
    setActiveBg((prev) => (prev === "dots" ? "circuit" : "dots"));
  };

  return (
    <>
      {/* Dynamic Background Canvas Renderer */}
      {activeBg === "dots" ? <ParticleBackground /> : <CircuitBackground />}

      {/* Floating Theme Switcher Control */}
      <button
        onClick={toggleBackground}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "8px 16px",
          borderRadius: "12px",
          border: "1px solid #f1c40f",
          background: "#2c0b3e",
          color: "#f1c40f",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
      >
        {activeBg === "dots" ? "⚡ Switch to Circuit" : "🌌 Switch to Dots"}
      </button>
    </>
  );
}