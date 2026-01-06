import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY =
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';

// Mã hóa file
export const encryptFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
                const iv = CryptoJS.lib.WordArray.random(16);

                const encrypted = CryptoJS.AES.encrypt(
                    wordArray,
                    CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
                    {
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }
                );

                resolve({
                    iv: iv.toString(CryptoJS.enc.Hex),
                    encryptedData: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

// Giải mã file
export const decryptFile = (encryptedBase64, ivHex, fileType) => {
    try {
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const ciphertext = CryptoJS.enc.Base64.parse(encryptedBase64);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const typedArray = convertWordArrayToUint8Array(decrypted);
        return new Blob([typedArray], { type: fileType });
    } catch (error) {
        console.error('File decryption error:', error);
        throw error;
    }
};

function convertWordArrayToUint8Array(wordArray) {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8 = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
        u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8;
}