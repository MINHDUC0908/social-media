import axios from "axios";
import { useEffect, useState } from "react";
import api from "../api/api";

function useUser()
{
    const [usersGr, setUsersGr] = useState([])
    const [conversations, setConversations] = useState([]);
    const [receiverInfo, setReceiverInfo] = useState(null);

    const [profile, setProfile] = useState();

    const [ loading, setLoading ] = useState(true)
    const fetchUsersGr = async () => {
        try {
            const res = await axios.get(api + "users", {   
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.data) {
                setUsersGr(res.data)
            }
        } catch (error) {
            console.error("❌ Lỗi khi fetch users:", error);
        }   
    }

    const fetchConversations = async () => {
        try {
            const res = await axios.get(api + "chat/conversations", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.data) {
                // map thêm avatar vào cho đồng nhất
                const mapped = res.data.map(c => ({
                    id: c.id,
                    name: c.name,
                    image_url: c.image_url,
                    avatar: `https://i.pravatar.cc/50?u=${c.id ? c.id : c.conversationId}`,
                    lastMessage: c.lastMessage,
                    lastSenderId: c.lastSenderId,
                    lastTime: c.lastTime,
                    unreadCount: c.unreadCount || 0 ,
                    isGroup: c.isGroup,
                    conversationId: c.conversationId,
                    conversationName: c.conversationName,
                    isOnline: c.isGroup ? null : Boolean(Number(c.is_online)),
                    lastActive: c.last_active ? new Date(c.last_active) : null,
                    total_members: c.total_members,
                    is_read: c.is_read
                }));
                setConversations(mapped);
            }
        } catch (error) {
            console.error("❌ Lỗi khi fetch conversations:", error);
        }
    };

    // Hiển thị tất cả tin nhắn
    const fetchReceiver = async (receiverId) => {
        try {
            const res = await axios.get(api + `auth/user/${receiverId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setReceiverInfo(res.data);
        } catch (err) {
            console.error("❌ Lỗi fetch receiver:", err);
        }
    };


    const fectUser = async () => {
        setLoading(true)
        try {
            const res = await axios.get(api + "users/user", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })

            if (res.data)
            {
                setProfile(res.data)
            }
        } catch (error) {
            console.error("❌ Lỗi fetch receiver:", err);
        } finally {

            setTimeout(() => {
                setLoading(false)
            }, 200)
        }
    } 
    useEffect(() => {
        fetchUsersGr()    
    }, [])

    useEffect(() => {
        fectUser()
    }, [])
    return { usersGr, conversations, fetchConversations, setConversations, fetchReceiver, receiverInfo, profile, setProfile, loading}
}

export default useUser