import { ImageResponse } from "next/og";
import { fetchProductBySlug } from "@/lib/queries/products";
import { formatIDR } from "@/lib/types";
import { absoluteUrl } from "@/lib/seo";

export const alt = "Product — Open Graph image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  const title = product?.name ?? "Product";
  const price = product ? formatIDR(product.price) : "";
  const first = (product as any)?.images?.[0];
  const img = first ? absoluteUrl(first) : absoluteUrl("/placeholders/product.svg");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAF8F5 0%, #F3EFE9 100%)",
          color: "#111",
          letterSpacing: "-0.02em",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 32,
            width: 1024,
            padding: 48,
            borderRadius: 24,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid #E9E5DE",
          }}
        >
          <img
            src={img}
            width={540}
            height={540}
            alt=""
            style={{ borderRadius: 16, objectFit: "cover", background: "#eee" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ fontSize: 64, fontWeight: 700 }}>{title}</div>
            {price ? <div style={{ fontSize: 40 }}>{price}</div> : null}
          </div>
        </div>
        <img
          src={absoluteUrl("/og/logo.svg")}
          width={96}
          height={96}
          alt="Temurun logo"
          style={{ position: "absolute", left: 48, bottom: 48, color: "#111" }}
        />
      </div>
    ),
    { ...size }
  );
}
