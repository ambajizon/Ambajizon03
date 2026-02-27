/**
 * Enterprise-grade AES-256-GCM encryption utility.
 * Uses Node.js native `crypto` module — no third-party dependencies.
 *
 * Format stored in DB: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 * IV is randomly generated per-encryption for semantic security.
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // 96-bit IV — recommended for GCM
const TAG_LENGTH = 16  // 128-bit auth tag

// Hard-fail at module load time — never boot with a compromised key
const rawKey = process.env.ENCRYPTION_KEY

if (!rawKey || rawKey.trim() === '') {
    throw new Error(
        'FATAL: ENCRYPTION_KEY environment variable is not set. ' +
        'Set a 64-character hex string (256-bit key) in your .env.local file. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
}

// Accept either a 64-char hex key (32 bytes) or derive 32 bytes via SHA-256
const SECRET_KEY: Buffer = rawKey.length === 64
    ? Buffer.from(rawKey, 'hex')
    : crypto.createHash('sha256').update(rawKey).digest()

if (SECRET_KEY.length !== 32) {
    throw new Error('FATAL: ENCRYPTION_KEY must derive to exactly 32 bytes (256 bits).')
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns a colon-delimited hex string: `<iv>:<authTag>:<ciphertext>`
 */
export const encrypt = (plaintext: string): string => {
    if (!plaintext) return ''
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv, { authTagLength: TAG_LENGTH })
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypts an AES-256-GCM ciphertext produced by `encrypt()`.
 * Returns empty string on failure (tampered data, wrong key, legacy format).
 */
export const decrypt = (ciphertext: string): string => {
    if (!ciphertext) return ''
    try {
        const parts = ciphertext.split(':')
        if (parts.length !== 3) {
            // Legacy CryptoJS format or malformed — cannot decrypt
            console.error('[encryption] decrypt: unrecognised format (expected iv:tag:data)')
            return ''
        }
        const [ivHex, tagHex, encryptedHex] = parts
        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(tagHex, 'hex')
        const encryptedData = Buffer.from(encryptedHex, 'hex')

        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv, { authTagLength: TAG_LENGTH })
        decipher.setAuthTag(authTag)
        const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
        return decrypted.toString('utf8')
    } catch (e) {
        console.error('[encryption] decrypt failed (tampered data or wrong key):', (e as Error).message)
        return ''
    }
}
