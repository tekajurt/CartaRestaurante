import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

function base64Encode(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64Decode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

function createSignature(data: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
}

export function jwtEncode(payload: Record<string, unknown>): string {
  const header = base64Encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64Encode(JSON.stringify(payload));
  const signature = createSignature(`${header}.${encodedPayload}`);

  return `${header}.${encodedPayload}.${signature}`;
}

export function jwtDecode(token: string): Record<string, unknown> {
  try {
    const [header, payload, signature] = token.split(".");

    // Verify signature
    const expectedSignature = createSignature(`${header}.${payload}`);
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }

    return JSON.parse(base64Decode(payload));
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error}`);
  }
}
