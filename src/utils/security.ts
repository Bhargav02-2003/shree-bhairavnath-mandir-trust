/**
 * Security Utility for Client Payload Encryption
 * Encrypts sensitive fields (like password) before transmitting over the network payload.
 */

const AUTH_PAYLOAD_KEY = "shree_bhairavnath_secret_key_32b";

/**
 * Encrypts plain text string using AES-CBC (Web Crypto API)
 */
export async function encryptPayloadPassword(password: string): Promise<string> {
  if (!password) return password;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const keyData = encoder.encode(AUTH_PAYLOAD_KEY);

    const key = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      data
    );

    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const cipherHex = Array.from(new Uint8Array(encrypted))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `ENC:${ivHex}:${cipherHex}`;
  } catch (err) {
    console.error("Payload encryption error:", err);
    return password;
  }
}
