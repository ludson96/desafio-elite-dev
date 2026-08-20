import crypto from "node:crypto";
import QRCode from "qrcode";
import { env } from "../config/env.js";

/**
 * Gera uma assinatura HMAC criptográfica para garantir que o código do ingresso não seja forjado.
 */
export function generateTicketSignature(ticketCode: string, eventId: string): string {
  const data = `${ticketCode}:${eventId}`;
  return crypto.createHmac("sha256", env.QR_SECRET).update(data).digest("hex");
}

/**
 * Valida se a assinatura HMAC corresponde aos dados do ingresso.
 */
export function verifyTicketSignature(ticketCode: string, eventId: string, signature: string): boolean {
  const expectedSignature = generateTicketSignature(ticketCode, eventId);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Gera a imagem do QR Code em formato Base64 Data URL (para renderização direta no front-end).
 */
export async function generateQRCodeDataURL(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}
