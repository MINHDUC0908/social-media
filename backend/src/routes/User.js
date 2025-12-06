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

        console.log("✅ FCM token saved successfully");
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


router.post("/ai/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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

module.exports = router