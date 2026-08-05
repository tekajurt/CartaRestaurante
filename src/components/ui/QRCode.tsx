"use client";

type QRCodeProps = {
  url: string;
  size?: number;
  className?: string;
};

export default function QRCode({ url, size = 250, className }: QRCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

  return (
    <img
      src={src}
      alt={`QR para ${url}`}
      width={size}
      height={size}
      className={className}
    />
  );
}
