import React, { useState, useEffect } from "react";
import ParticleBackground from "./BackgroundCanvas";
import CircuitBackground from "./BackgroundCanvas2";

/**
 * BackgroundManager Component.
 * Listens for theme toggle events and switches active background canvas.
 *
 * @component
 * @returns {React.ReactElement} Active background component.
 */
export default function BackgroundManager() {
  const [activeBg, setActiveBg] = useState("dots");

  useEffect(() => {
    const handleToggle = (e) => {
      
      if (e.detail?.theme) {
        setActiveBg(e.detail.theme);
      } else {
        
        setActiveBg((prev) => (prev === "dots" ? "circuit" : "dots"));
      }
    };

    window.addEventListener("toggle-bg-theme", handleToggle);
    return () => window.removeEventListener("toggle-bg-theme", handleToggle);
  }, []);

  return activeBg === "dots" ? <ParticleBackground /> : <CircuitBackground />;
}