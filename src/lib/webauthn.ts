const CRED_KEY = 'floww-faceid-cred'

function randomChallenge(): ArrayBuffer {
  return crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function bufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

export function hasCredential(): boolean {
  return !!localStorage.getItem(CRED_KEY)
}

export function clearCredential(): void {
  localStorage.removeItem(CRED_KEY)
}

export function isBiometricSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

export async function registerBiometric(): Promise<void> {
  const rpId = window.location.hostname

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { id: rpId, name: 'Floww' },
      user: {
        id: new TextEncoder().encode('floww-user').buffer as ArrayBuffer,
        name: 'floww-user',
        displayName: 'Floww User',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  }) as PublicKeyCredential | null

  if (!credential) throw new Error('Registration cancelled')

  localStorage.setItem(CRED_KEY, bufferToBase64(credential.rawId))
}

export async function authenticateBiometric(): Promise<void> {
  const stored = localStorage.getItem(CRED_KEY)
  if (!stored) throw new Error('No credential registered')

  const rpId = window.location.hostname

  const result = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      rpId,
      allowCredentials: [{ id: base64ToBuffer(stored), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  }) as PublicKeyCredential | null

  if (!result) throw new Error('Authentication cancelled')
}
