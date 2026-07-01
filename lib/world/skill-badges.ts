function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
export function drawSkillBadge(
  ctx: CanvasRenderingContext2D,
  skillId: string,
  cx: number,
  cy: number,
  size: number,
  alpha = 1,
  active = false,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const s = size;
  const x0 = cx - s / 2;
  const y0 = cy - s / 2;
  px(ctx, x0 - 2, y0 + s - 4, s + 4, 4, active ? "#fff8e0" : "#3a3848");
  switch (skillId) {
    case "typescript":
      px(ctx, x0, y0, s, s, "#3178c6");
      px(ctx, x0 + 2, y0 + 2, s - 4, s - 4, "#235a97");
      ctx.font = `bold ${Math.max(8, Math.round(s * 0.38))}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.fillText("TS", cx, cy + 1);
      break;
    case "react":
      px(ctx, x0, y0, s, s, "#0a1628");
      ctx.strokeStyle = "#61dafb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.22, s * 0.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.22, s * 0.1, Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.22, s * 0.1, -Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      px(ctx, cx - 2, cy - 2, 4, 4, "#61dafb");
      break;
    case "nextjs":
      px(ctx, x0, y0, s, s, "#0a0a0a");
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `bold ${Math.max(10, Math.round(s * 0.45))}px monospace`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", cx, cy + 1);
      break;
    case "redux-toolkit":
      px(ctx, x0, y0, s, s, "#764abc");
      px(ctx, x0 + 4, y0 + 4, s - 8, s - 8, "#5a38a0");
      ctx.font = `bold ${Math.max(9, Math.round(s * 0.42))}px monospace`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("R", cx, cy + 1);
      break;
    case "swr":
      px(ctx, x0, y0, s, s, "#0a0a0a");
      ctx.font = `bold ${Math.max(8, Math.round(s * 0.32))}px monospace`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SWR", cx, cy + 1);
      break;
    case "pwa":
      px(ctx, x0 + 6, y0 + 2, s - 12, s - 6, "#1a2848");
      px(ctx, x0 + 8, y0 + 4, s - 16, s - 12, "#38bdf8");
      px(ctx, x0 + s / 2 - 2, y0 + s - 8, 4, 3, "#fff");
      break;
    case "swift":
      px(ctx, x0, y0, s, s, "#f05138");
      ctx.font = `bold ${Math.max(9, Math.round(s * 0.38))}px monospace`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Sw", cx, cy + 1);
      break;
    case "rust":
      px(ctx, x0, y0, s, s, "#1a1a1a");
      px(ctx, x0 + 3, y0 + 3, s - 6, s - 6, "#dea584");
      ctx.font = `bold ${Math.max(9, Math.round(s * 0.38))}px monospace`;
      ctx.fillStyle = "#1a1a1a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Ru", cx, cy + 1);
      break;
    case "tailwind":
      px(ctx, x0, y0, s, s, "#0f172a");
      for (let i = 0; i < 3; i += 1) {
        px(
          ctx,
          x0 + 4 + i * 7,
          y0 + 8,
          5,
          3,
          i === 0 ? "#38bdf8" : i === 1 ? "#22d3ee" : "#818cf8",
        );
      }
      break;
    case "ci-cd":
      px(ctx, x0, y0, s, s, "#1e293b");
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      px(ctx, cx - 1, cy - s * 0.28, 2, s * 0.2, "#94a3b8");
      break;
    case "performance":
      px(ctx, x0, y0, s, s, "#1a1208");
      px(ctx, cx - 2, y0 + 4, 4, s * 0.55, "#fbbf24");
      px(ctx, cx - 6, y0 + 8, 4, 4, "#fbbf24");
      px(ctx, cx + 4, y0 + 12, 4, 4, "#fbbf24");
      break;
    case "testing":
      px(ctx, x0, y0, s, s, "#14532d");
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy);
      ctx.lineTo(cx - 2, cy + s * 0.18);
      ctx.lineTo(cx + s * 0.22, cy - s * 0.15);
      ctx.stroke();
      break;
    case "accessibility":
      px(ctx, x0, y0, s, s, "#1e3a5f");
      px(ctx, cx - 3, y0 + 6, 6, 6, "#38bdf8");
      px(ctx, cx - 6, y0 + 12, 12, 8, "#38bdf8");
      break;
    case "architecture":
    case "design-systems":
      px(ctx, x0, y0, s, s, "#1a1830");
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          px(ctx, x0 + 4 + col * 9, y0 + 4 + row * 9, 7, 7, active ? "#a5b4fc" : "#6366f1");
        }
      }
      break;
    default:
      px(ctx, x0, y0, s, s, "#2a2438");
      ctx.font = `bold ${Math.max(8, Math.round(s * 0.35))}px monospace`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(skillId.slice(0, 2).toUpperCase(), cx, cy + 1);
      break;
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}
