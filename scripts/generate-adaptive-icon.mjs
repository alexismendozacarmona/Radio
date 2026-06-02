// Generates Android adaptive icon assets from assets/icon.png:
//   - assets/icon-background.png : solid color matching the source's background corner
//   - assets/icon-foreground.png : source logo scaled to 66% safe zone, centered, transparent canvas
// Run after editing assets/icon.png, then `npx @capacitor/assets generate --android`.

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "assets", "icon.png");
const OUT_BG = path.join(ROOT, "assets", "icon-background.png");
const OUT_FG = path.join(ROOT, "assets", "icon-foreground.png");
const OUT_ONLY = path.join(ROOT, "assets", "icon-only.png");

const CANVAS = 1024;
// El logo ocupa (casi) todo el lienzo del foreground. La "zona segura" la
// aplica el propio XML adaptive-icon con su inset (~16.7%); NO hay que
// pre-encoger aquí o el logo queda diminuto (doble encogido).
const SAFE_ZONE_RATIO = 1.0;
const FG_SIZE = Math.round(CANVAS * SAFE_ZONE_RATIO);
const PAD = Math.round((CANVAS - FG_SIZE) / 2);

const cornerBuf = await sharp(SRC)
  .extract({ left: 0, top: 0, width: 1, height: 1 })
  .raw()
  .toBuffer();
const [r, g, b] = cornerBuf;
console.log(`Detected background color: rgb(${r}, ${g}, ${b}) — #${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`);

await sharp({
  create: { width: CANVAS, height: CANVAS, channels: 4, background: { r, g, b, alpha: 1 } },
})
  .png()
  .toFile(OUT_BG);
console.log(`Wrote ${OUT_BG}`);

const resizedLogo = await sharp(SRC).resize(FG_SIZE, FG_SIZE, { fit: "contain" }).toBuffer();

await sharp({
  create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: resizedLogo, top: PAD, left: PAD }])
  .png()
  .toFile(OUT_FG);
console.log(`Wrote ${OUT_FG}`);

// Legacy launcher icon (Android <8): logo at 66% safe zone over solid background.
await sharp({
  create: { width: CANVAS, height: CANVAS, channels: 4, background: { r, g, b, alpha: 1 } },
})
  .composite([{ input: resizedLogo, top: PAD, left: PAD }])
  .png()
  .toFile(OUT_ONLY);
console.log(`Wrote ${OUT_ONLY}`);
