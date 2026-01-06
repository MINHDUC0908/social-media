const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { decryptFile } = require('../utils/encryption');

// Download và giải mã file
router.get('/decrypt/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        const { iv } = req.query;

        if (!iv) {
            return res.status(400).json({ error: 'IV is required' });
        }

        const filePath = path.join(__dirname, '../../uploads/encrypted', fileName);
        const encryptedBuffer = await fs.readFile(filePath);

        // Giải mã file
        const decryptedBuffer = decryptFile(encryptedBuffer, iv);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(decryptedBuffer);

    } catch (error) {
        console.error('Decrypt file error:', error);
        res.status(500).json({ error: 'Failed to decrypt file' });
    }
});

module.exports = router;