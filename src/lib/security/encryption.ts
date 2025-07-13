import crypto from 'crypto';
import { createCipheriv, createDecipheriv, randomBytes, scrypt, timingSafeEqual } from 'crypto';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
// const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const HASH_ALGORITHM = 'sha256';
const HASH_ITERATIONS = 100000;

export class EncryptionService {
  private masterKey: Buffer;

  constructor() {
    const masterKeyString = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKeyString) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
    }
    
    this.masterKey = Buffer.from(masterKeyString, 'hex');
    if (this.masterKey.length !== KEY_LENGTH) {
      throw new Error('Master key must be 32 bytes (256 bits)');
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(data: string): Promise<string> {
    try {
      // Generate random IV
      const iv = randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = createCipheriv(ENCRYPTION_ALGORITHM, this.masterKey, iv);
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine IV, encrypted data, and tag
      const result = iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
      
      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      // Split the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const [ivHex, encrypted, tagHex] = parts;
      
      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      // Create decipher
      const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, this.masterKey, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash password with salt
   */
  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate random salt
      const salt = randomBytes(SALT_LENGTH);
      
      // Hash password with salt
      scrypt(password, salt, KEY_LENGTH, { N: HASH_ITERATIONS }, (err, derivedKey) => {
        if (err) {
          reject(new Error(`Password hashing failed: ${err.message}`));
          return;
        }
        
        // Combine salt and hash
        const result = salt.toString('hex') + ':' + derivedKey.toString('hex');
        resolve(result);
      });
    });
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Split salt and hash
        const parts = hash.split(':');
        if (parts.length !== 2) {
          reject(new Error('Invalid hash format'));
          return;
        }
        
        const [saltHex, hashHex] = parts;
        const salt = Buffer.from(saltHex, 'hex');
        const storedHash = Buffer.from(hashHex, 'hex');
        
        // Hash the provided password with the same salt
        scrypt(password, salt, KEY_LENGTH, { N: HASH_ITERATIONS }, (err, derivedKey) => {
          if (err) {
            reject(new Error(`Password verification failed: ${err.message}`));
            return;
          }
          
          // Compare hashes using timing-safe comparison
          const isValid = timingSafeEqual(storedHash, derivedKey);
          resolve(isValid);
        });
      } catch (error) {
        reject(new Error(`Password verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate secure random ID
   */
  generateId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Hash data for integrity checking
   */
  hashData(data: string): string {
    return crypto.createHash(HASH_ALGORITHM).update(data).digest('hex');
  }

  /**
   * Generate HMAC for data authentication
   */
  generateHMAC(data: string, key: string): string {
    return crypto.createHmac(HASH_ALGORITHM, key).update(data).digest('hex');
  }

  /**
   * Verify HMAC for data authentication
   */
  verifyHMAC(data: string, key: string, hmac: string): boolean {
    const expectedHMAC = this.generateHMAC(data, key);
    return timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHMAC, 'hex'));
  }
}

export class SecureKeyManager {
  private keys: Map<string, Buffer> = new Map();

  /**
   * Generate a new encryption key
   */
  generateKey(keyId: string): Buffer {
    const key = randomBytes(KEY_LENGTH);
    this.keys.set(keyId, key);
    return key;
  }

  /**
   * Get an existing key
   */
  getKey(keyId: string): Buffer | null {
    return this.keys.get(keyId) || null;
  }

  /**
   * Rotate encryption key
   */
  rotateKey(keyId: string): Buffer {
    const newKey = randomBytes(KEY_LENGTH);
    this.keys.set(keyId, newKey);
    return newKey;
  }

  /**
   * Remove a key
   */
  removeKey(keyId: string): boolean {
    return this.keys.delete(keyId);
  }

  /**
   * List all key IDs
   */
  listKeys(): string[] {
    return Array.from(this.keys.keys());
  }
}

export class DataProtection {
  private encryptionService: EncryptionService;
  private keyManager: SecureKeyManager;

  constructor() {
    this.encryptionService = new EncryptionService();
    this.keyManager = new SecureKeyManager();
  }

  /**
   * Encrypt sensitive user data
   */
  async encryptUserData(userId: string, data: any): Promise<string> {
    const jsonData = JSON.stringify(data);
    return await this.encryptionService.encrypt(jsonData);
  }

  /**
   * Decrypt sensitive user data
   */
  async decryptUserData(userId: string, encryptedData: string): Promise<any> {
    const decrypted = await this.encryptionService.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }

  /**
   * Encrypt API keys and tokens
   */
  async encryptApiKey(keyName: string, apiKey: string): Promise<string> {
    return await this.encryptionService.encrypt(apiKey);
  }

  /**
   * Decrypt API keys and tokens
   */
  async decryptApiKey(keyName: string, encryptedKey: string): Promise<string> {
    return await this.encryptionService.decrypt(encryptedKey);
  }

  /**
   * Hash sensitive identifiers
   */
  hashIdentifier(identifier: string, salt?: string): string {
    const saltToUse = salt || randomBytes(16).toString('hex');
    const hash = crypto.createHash(HASH_ALGORITHM)
      .update(identifier + saltToUse)
      .digest('hex');
    return `${saltToUse}:${hash}`;
  }

  /**
   * Verify hashed identifier
   */
  verifyIdentifier(identifier: string, hashedIdentifier: string): boolean {
    const [salt, hash] = hashedIdentifier.split(':');
    const expectedHash = crypto.createHash(HASH_ALGORITHM)
      .update(identifier + salt)
      .digest('hex');
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  }

  /**
   * Sanitize sensitive data for logging
   */
  sanitizeForLogging(data: any): any {
    if (typeof data === 'string') {
      // Mask email addresses
      return data.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') || 
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForLogging(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Generate secure session token
   */
  generateSessionToken(userId: string): string {
    const timestamp = Date.now().toString();
    const random = this.encryptionService.generateToken(16);
    const data = `${userId}:${timestamp}:${random}`;
    return this.encryptionService.hashData(data);
  }

  /**
   * Validate session token
   */
  validateSessionToken(token: string, userId: string, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    try {
      // This is a simplified validation - in practice, you'd store tokens in a database
      // and check against stored values with proper expiration handling
      return token.length === 64 && /^[a-f0-9]+$/i.test(token);
    } catch {
      return false;
    }
  }
}

// Export singleton instances
export const encryptionService = new EncryptionService();
export const secureKeyManager = new SecureKeyManager();
export const dataProtection = new DataProtection(); 