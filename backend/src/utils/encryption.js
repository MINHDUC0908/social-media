const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : crypto.randomBytes(32);
const IV_LENGTH = 16;

// Mã hóa file
function encryptFile(buffer) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted
        };
    } catch (error) {
        console.error('File encryption error:', error);
        throw error;
    }
}

// Giải mã file
function decryptFile(encryptedBuffer, ivHex) {
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
        
        return decrypted;
    } catch (error) {
        console.error('File decryption error:', error);
        throw error;
    }
}

module.exports = { 
    encryptFile, 
    decryptFile 
};