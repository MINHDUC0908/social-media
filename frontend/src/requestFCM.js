// src/requestFCM.js
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";
import api from "./api/api";

export const requestPermission = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {

            // Lấy token (không xóa token cũ nữa)
            const token = await getToken(messaging, {
                vapidKey: "BLQSOlka3XusNDOrbQjdjZ_tHuDLTgsNv5VXjkwSX63543ob52wYIPN6FuQSlVuoIyNxvadqOR2q2Fyb5LPcYt4"
            });
            // Gửi token lên server
            const accessToken = localStorage.getItem("token");
            
            if (!accessToken) {
                console.warn("⚠️ No access token found");
                return token;
            }

            try {
                const response = await axios.post(
                    `${api}users/fcm-token`,
                    { fcm_token: token },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
            } catch (apiError) {
                console.error("❌ Failed to save token:", apiError.response?.data || apiError.message);
            }
            return token;
        } else {
            console.log("❌ Notification permission denied");
            return null;
        }
    } catch (err) {
        console.error("❌ Error getting FCM token:", err);
        return null;
    }
};