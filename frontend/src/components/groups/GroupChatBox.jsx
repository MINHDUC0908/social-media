import { X, Minus, Send, Image, Smile, ThumbsUp, Phone } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import useGroup from "../../hooks/useGroup";
import ChatGroupMessage from './ChatGroupMessage';
import socket from '../../utils/socket';
import ChatLoading from '../ui/ChatLoading';

export function GroupChatBox({ group, closeChat, user, onToggleMinimize, startGroupCall }) {
    const [isMinimized, setIsMinimized] = useState(group?.isMinimized || false);
    const { messages, fetchMesGr, setMessages, loading } = useGroup();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const isMinimizedRef = useRef(isMinimized);
    useEffect(() => {
        isMinimizedRef.current = isMinimized;
    }, [isMinimized]);

    useEffect(() => {
        if (!group?.id) return;
        socket.emit("join_group", { groupId: group.id });
        fetchMesGr(group?.id);
    }, [group?.id]);

    useEffect(() => {
        const handleGroupMessage = (data) => {
            if (parseInt(data.groupId) !== parseInt(group.id)) return;

            const newMessage = {
                id: data.id || Date.now(),
                sender_id: data.senderId,
                content: data.content,
                imageUrl: data.imageUrl || null,
                created_at: data.createdAt,
                sender: data.senderInfo || null,
            };

            setMessages(prev => [...prev, newMessage]);

            if (isMinimizedRef.current && data.senderId !== user.id) {
                setIsMinimized(false);
                onToggleMinimize(false);
            }
        };

        const handleGroupImage = (data) => {
            if (parseInt(data.groupId) !== parseInt(group.id)) return;

            const imgMsg = {
                id: Date.now(),
                sender_id: data.senderId,
                content: null,
                imageUrl: data.imageUrl || data.fileUrl,
                created_at: data.createdAt || new Date().toISOString(),
                sender: data.senderInfo || { name: data.name },
            };

            setMessages(prev => [...prev, imgMsg]);

            if (isMinimizedRef.current && data.senderId !== user.id) {
                setIsMinimized(false);
                onToggleMinimize(false);
            }
        };

        socket.on("group_message", handleGroupMessage);
        socket.on("send_group_image", handleGroupImage);

        return () => {
            socket.off("group_message", handleGroupMessage);
            socket.off("send_group_image", handleGroupImage);
        };
    }, [group.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e?.preventDefault();
        const content = inputValue.trim();
        if (!content) return;

        socket.emit("send_group_message", {
            groupId: parseInt(group.id),
            senderId: user?.id,
            content: content,
        });

        setInputValue('');
    };

    const toggleMinimize = () => {
        setIsMinimized(prev => {
            const newState = !prev;
            onToggleMinimize(newState);
            return newState;
        });
    };

    const handleStartCall = () => {
        if (startGroupCall) {
            startGroupCall(group);
        }
    };

    if (loading) return (
        <div className="w-80 h-[500px] bg-white shadow-xl rounded-lg flex items-center justify-center">
            <ChatLoading />
        </div>
    );

    return (
        <div className={`bg-white shadow-2xl rounded-t-lg flex flex-col transition-all duration-200 
            ${isMinimized ? "w-80 h-12" : "w-80 h-[500px]"}`}>
            <div className="flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={toggleMinimize}>
                    <img src={group.avatar || "/group-icon.png"} alt={group.name}
                        className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                            {group.conversationName || group.name}
                        </span>
                        <span className="text-xs text-gray-500">{group.total_members} thành viên</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleStartCall}
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full"
                        title="Gọi audio nhóm"
                    >
                        <Phone size={16} />
                    </button>
                    <button onClick={toggleMinimize} className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full">
                        <Minus size={16} />
                    </button>
                    <button onClick={() => closeChat(group.id)} className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="flex-1 p-3 overflow-y-auto bg-white">
                        <ChatGroupMessage
                            messages={messages}
                            messagesEndRef={messagesEndRef}
                            user={user}
                        />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-2 border-t bg-white rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <button type="button" className="text-blue-500 hover:bg-gray-100 p-2 rounded-full">
                                <Image size={18} />
                            </button>
                            <button type="button" className="text-blue-500 hover:bg-gray-100 p-2 rounded-full">
                                <Smile size={18} />
                            </button>

                            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3">
                                <input
                                    type="text"
                                    placeholder="Aa"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none"
                                />
                            </div>
                            {inputValue.trim() ? (
                                <button type="submit" className="text-blue-500 hover:bg-gray-100 p-2 rounded-full">
                                    <Send size={18} />
                                </button>
                            ) : (
                                <button type="button" className="text-blue-500 hover:bg-gray-100 p-2 rounded-full">
                                    <ThumbsUp size={18} />
                                </button>
                            )}
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}