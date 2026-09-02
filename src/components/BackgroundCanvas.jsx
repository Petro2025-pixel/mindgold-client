import { useEffect, useRef } from "react";

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let animationId = null;

    const GRID = 25;
    let liveTraces = [];
    let signals = [];

    const MAX_TRACES = 13;
    const MAX_SIGNALS = 10;
    const TRACE_BUILD_SPEED = 0.005;
    const TRACE_FADE_SPEED = 0.0025;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createTrace(startPoint = null) {
      const startX = startPoint
        ? startPoint.x
        : Math.floor(Math.random() * ((width - 80) / GRID)) * GRID + GRID;

      const startY = startPoint
        ? startPoint.y
        : Math.floor(Math.random() * ((height - 80) / GRID)) * GRID + GRID;

      let x = startX;
      let y = startY;
      let dir = Math.random() > 0.5;

      const segments = [];
      const numSegments = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < numSegments; i++) {
        const len = (Math.floor(Math.random() * 4) + 2) * GRID;
        const sign = Math.random() > 0.5 ? 1 : -1;

        let newX = x;
        let newY = y;

        if (dir) newX += len * sign;
        else newY += len * sign;

        newX = Math.max(GRID, Math.min(width - GRID, newX));
        newY = Math.max(GRID, Math.min(height - GRID, newY));

        segments.push({ from: { x, y }, to: { x: newX, y: newY } });

        x = newX;
        y = newY;
        dir = !dir;
      }

      return {
        segments,
        progress: 0,
        life: 1.2,
        fade: 1,
        padsShown: false,
        branched: false,
        length: null,
      };
    }

    function getLength(trace) {
      if (trace.length !== null) return trace.length;
      let len = 0;
      for (let s of trace.segments) {
        len += Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);
      }
      trace.length = len;
      return len;
    }

    function getPointOnTrace(trace, progress) {
      const total = getLength(trace);
      const target = total * progress;
      let dist = 0;

      for (let s of trace.segments) {
        const segLen = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);
        if (dist + segLen >= target) {
          const t = (target - dist) / segLen;
          return {
            x: s.from.x + (s.to.x - s.from.x) * t,
            y: s.from.y + (s.to.y - s.from.y) * t,
          };
        }
        dist += segLen;
      }

      const last = trace.segments[trace.segments.length - 1];
      return last ? last.to : null;
    }

    function drawPartial(trace) {
      const total = getLength(trace);
      const maxDist = total * trace.progress;
      let dist = 0;

      ctx.beginPath();

      for (let s of trace.segments) {
        const segLen = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);

        if (dist + segLen < maxDist) {
          ctx.moveTo(s.from.x, s.from.y);
          ctx.lineTo(s.to.x, s.to.y);
        } else {
          const t = (maxDist - dist) / segLen;
          const x = s.from.x + (s.to.x - s.from.x) * t;
          const y = s.from.y + (s.to.y - s.from.y) * t;
          ctx.moveTo(s.from.x, s.from.y);
          ctx.lineTo(x, y);
          break;
        }
        dist += segLen;
      }

      ctx.strokeStyle = `rgba(241,196,15,${trace.fade})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function drawPads(trace) {
      for (let s of trace.segments) {
        drawPad(s.from.x, s.from.y, trace.fade);
        drawPad(s.to.x, s.to.y, trace.fade);
      }
    }

    function drawPad(x, y, alpha) {
      ctx.fillStyle = `rgba(241,196,15,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSignal(signal) {
      const p = getPointOnTrace(signal.trace, signal.progress);
      if (!p) return;

      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(255,255,200,0.8)";
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function update() {
      if (liveTraces.length < MAX_TRACES && Math.random() < 0.055) {
        liveTraces.push(createTrace());
      }

      for (let t of liveTraces) {
        if (t.progress < 1) {
          t.progress += TRACE_BUILD_SPEED;
        } else {
          t.padsShown = true;
          t.life -= 0.005;
          if (t.life <= 0) t.fade -= TRACE_FADE_SPEED;
        }

        if (!t.branched && t.progress > 0.5 && Math.random() < 0.02) {
          const point = getPointOnTrace(t, t.progress);
          if (point && liveTraces.length < MAX_TRACES) {
            liveTraces.push(createTrace(point));
            t.branched = true;
          }
        }
      }

      liveTraces = liveTraces.filter((t) => t.fade > 0);

      if (
        signals.length < MAX_SIGNALS &&
        Math.random() < 0.05 &&
        liveTraces.length
      ) {
        const trace = liveTraces[Math.floor(Math.random() * liveTraces.length)];
        if (trace.progress > 0.6) {
          signals.push({
            trace,
            progress: 0,
            speed: 0.0035 + Math.random() * 0.005,
          });
        }
      }

      for (let s of signals) s.progress += s.speed;
      signals = signals.filter((s) => s.progress <= 1 && s.trace.fade > 0);
    }

    function draw() {
      ctx.fillStyle = "rgba(18, 5, 36, 0.12)";
      ctx.fillRect(0, 0, width, height);

      for (let t of liveTraces) {
        drawPartial(t);
        if (t.padsShown) drawPads(t);
      }

      for (let s of signals) drawSignal(s);
    }

    function animate() {
      update();
      draw();
      animationId = requestAnimationFrame(animate);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else {
        if (!animationId) animate();
      }
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} id="circuit-bg" />;
}
