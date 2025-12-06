import axios from "axios";
import { useState } from "react";
import api from "../api/api";

function useGroup()
{
    const [group, setGroup] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const fetchGroup = async (id) => {
        try {
            const res = await axios.get(api + `group/members/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.data)
            {
                setGroup(res.data)
            }
        } catch (error) {
            console.error("❌ Lỗi fetch receiver:", err);
        }
    }

    const fetchMesGr = async (groupId) => {
        try {
            const res = await axios.get(api + "group/mesGr/" + groupId, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
            if (res.data)
            {
                setMessages(res.data)
            }
        } catch (error) {
            console.error("❌ Lỗi fetch receiver:", err);
        } finally {
            setLoading(false)
        }
    }

    return { group, fetchGroup, fetchMesGr, messages, setMessages, loading }
}

export default useGroup