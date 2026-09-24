import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const alt = "Real Digital Works";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const logoBuffer = await sharp(
  await readFile(join(process.cwd(), "public/brand/logo-lockup.png")),
)
  .resize({ width: 800, withoutEnlargement: true })
  .png()
  .toBuffer();
const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a2230",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            borderRadius: 28,
            padding: "40px 48px",
          }}
        >
          <img src={logoSrc} height={440} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
