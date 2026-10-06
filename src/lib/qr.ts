import "server-only";
import QRCode from "qrcode";

const opts = { errorCorrectionLevel: "M" as const, margin: 2, color: { dark: "#120f0eff", light: "#ffffffff" } };

/** QR payload = the ticket code only. Validity lives in the database, so a copied QR passes once at most. */
export function ticketQrSvg(code: string): Promise<string> {
  return QRCode.toString(code, { ...opts, type: "svg" });
}

export function ticketQrPng(code: string): Promise<Buffer> {
  return QRCode.toBuffer(code, { ...opts, type: "png", width: 480 });
}
