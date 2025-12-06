import axios from "axios";
import { useState } from "react";
import api from "../api/api";

function useChat()
{
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(true)
    const fetchMessages = async (receiverId) => {
        try {
            const res = await axios.get(
                api + `chat/messages/${receiverId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setChat(res.data);
        } catch (err) {
            console.error("❌ Lỗi load tin nhắn:", err);
        } finally {
            setLoading(false)
        }
    };

    return { fetchMessages, chat, setChat, loading }
}

export default useChat