const express = require("express")
const router = express.Router()
const axios = require("axios");
require("dotenv").config();
const { userController, upload } = require("../app/controller/UserController");
const { User } = require("../app/model");

router.get("/", userController.getAllUsers)
router.get("/user", userController.getUser)
router.post("/upload-image",upload.single('image_url'), userController.uploadImage)

router.post("/fcm-token", async (req, res) => {
    try {
        const { fcm_token } = req.body;
        const userId = req.user.id;

        if (!fcm_token) {
            return res.status(400).json({ error: "FCM token is required" });
        }

        console.log("📝 Saving FCM token for user:", userId);

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.update({ fcm_token });
        res.json({ success: true, message: "FCM token saved" });

    } catch (error) {
        console.error("❌ Error saving FCM token:", error);
        res.status(500).json({ error: error.message });
    }
});


router.get("/ai/list-models", async (req, res) => {
    try {
        const response = await axios.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            {
                params: { 
                    key: "AIzaSyCnJJ9-EugrlWXeCTi8XJSCtG6OQEDGLaY" 
                }
            }
        );

        const models = response.data.models.map(m => ({
            name: m.name,
            displayName: m.displayName,
            supportedMethods: m.supportedGenerationMethods
        }));

        res.json({ models });

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error);
        res.status(500).json({ 
            error: error.response?.data 
        });
    }
});


router.post("/smart-reply", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const prompt = `Bạn là trợ lý gợi ý trả lời tin nhắn. 
Tin nhắn nhận được: "${message}"

Hãy đưa ra CHÍNH XÁC 3 câu trả lời ngắn gọn, tự nhiên và phù hợp với ngữ cảnh tiếng Việt.
Mỗi câu không quá 8 từ.
Trả về định dạng:
1. [câu trả lời 1]
2. [câu trả lời 2]
3. [câu trả lời 3]`;

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            },
            {
                params: { 
                    key: process.env.GEMINI_API_KEY
                }
            }
        );

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            throw new Error("No response from AI");
        }

        // Parse kết quả thành array
        const replies = aiText.split('\n')
            .filter(line => line.match(/^\d\./))
            .map(line => line.replace(/^\d\.\s*/, '').trim())
            .slice(0, 3);

        res.json({ replies });

    } catch (error) {
        console.error("❌ Smart Reply Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Smart reply failed",
            replies: []
        });
    }
});

// Route AI Chat (route cũ của bạn)
router.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
            {
                contents: [
                    {
                        parts: [{ text: message }]
                    }
                ]
            },
            {
                params: { 
                    key: process.env.GEMINI_API_KEY
                }
            }
        );

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            throw new Error("No response from AI");
        }

        res.json({ reply: aiText });

    } catch (error) {
        console.error("❌ AI Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "AI request failed",
            message: error.response?.data?.error?.message || error.message
        });
    }
});

module.exports = router;