// src/App.jsx
import { Route, Routes } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import ProtectedRoute from "./utils/ProtectedRoute";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import VibeConnect from "./pages/VibeConnect";
import { requestPermission } from "./requestFCM";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import socket from "./utils/socket";
import src from "./api/src";

function App() {
    const [currentTitle, setCurrentTitle] = useState("");
    const { user } = useAuth();
    useEffect(() => {
        document.title = currentTitle;
    }, [currentTitle]);

    useEffect(() => {
        const initFCM = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                return;
            }
            // Đăng ký Service Worker
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register(
                        '/firebase-messaging-sw.js',
                        { scope: '/' }
                    );
                    
                    await navigator.serviceWorker.ready;
                    
                } catch (error) {
                    console.error('❌ Service Worker registration failed:', error);
                }
            }
            // Request FCM permission
            await requestPermission();
        };
        initFCM();
        const unsubscribe = onMessage(messaging, ({ notification, data }) => {
            const { title = "Thông báo mới", body = "" } = notification || {};
            toast.custom(
                (t) => (
                    <div
                        className={`
                            flex items-center gap-3 p-4 rounded-xl shadow-lg border border-gray-200 bg-white transition-all duration-300 max-w-[380px]
                            ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
                        `}
                    >
                        <img
                            src="/logo.jpg" alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm mb-0.5">
                                {title}
                            </div>
                            <div className="text-gray-500 text-xs leading-5">
                                {body}
                            </div>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="bg-gray-100 hover:bg-gray-200 rounded-lg px-2.5 py-1.5 text-gray-500 text-xs font-medium transition-colors cursor-pointer "
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ),
                { duration: 8000 }
            );

            if (Notification.permission === "granted") {
                const notif = new Notification(title, {
                    body,
                    icon: avatar
                });
                notif.onclick = () => window.focus();
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!user) return;
        socket.emit("join", user.id);
        const handleSocketMessage = (msg, senderInfo) => {
            if (msg.sender_id !== user.id) {
                toast.custom(
                    (t) => (
                        <div
                            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border border-gray-200 bg-white transition-all duration-300
                                ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                            style={{ maxWidth: "600px", minWidth: "300px" }}
                        >
                            <img
                                src={src + senderInfo?.image_url}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover border"
                            />

                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">
                                    {senderInfo.name}
                                </p>
                                <p className="text-gray-600 text-sm truncate max-w-[250px]">
                                    {msg.content}
                                </p>
                            </div>

                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                ✕
                            </button>
                        </div>
                    ),
                    { duration: 5000, position: "top-right" }
                );

            }
        };

        socket.on("private_message", handleSocketMessage);

        return () => {
            socket.off("private_message", handleSocketMessage);
        };
    }, [user]);

    return (
        <>

                <Routes>
                    <Route path="/login" element={<Login setCurrentTitle={setCurrentTitle} />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <VibeConnect />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
}

export default App;