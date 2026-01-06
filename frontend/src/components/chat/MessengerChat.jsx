import { X, Minus, Phone, Video } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import socket from '../../utils/socket';
import useChat from '../../hooks/useChat';
import ChatList from './ChatList';
import src from '../../api/src';
import ChatLoading from '../ui/ChatLoading';
import MessageInput from './MessageInput';

export function ChatBox({ friend, closeChat, user, startCall, videoCall, isMinimized, onToggleMinimize }) {
    const { chat, setChat, fetchMessages, loading } = useChat();
    const [hasUnread, setHasUnread] = useState(false);

    const messagesEndRef = useRef(null);
    const isMinimizedRef = useRef(isMinimized);

    useEffect(() => {
        isMinimizedRef.current = isMinimized;
    }, [isMinimized]);

    // Fetch tin nhắn khi mở đúng chat
    useEffect(() => {
        if (!friend?.id || !user?.id) return;

        fetchMessages(friend.id);
        setHasUnread(false);
    }, [friend]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [chat]);

    // Kiểm tra có tin nhắn chưa đọc không
    useEffect(() => {
        if (!chat) return;

        const checkUnread = chat.some(msg =>
            Number(msg.sender_id) === Number(friend.id) &&
            Number(msg.receiver_id) === Number(user.id) &&
            msg.is_read === false
        );

        setHasUnread(checkUnread);
    }, [chat, friend.id]);

    // Mark as read khi click vào chat box
    const handleChatBoxClick = () => {
        if (!hasUnread) return;

        socket.emit("mark_as_read", {
            userId: Number(user.id),
            senderId: Number(friend.id),
        });

        setChat(prev =>
            prev.map(msg =>
                Number(msg.sender_id) === Number(friend.id) &&
                Number(msg.receiver_id) === Number(user.id)
                    ? { ...msg, is_read: true }
                    : msg
            )
        );

        setHasUnread(false);
    };

    // Socket listeners
    useEffect(() => {
        if (!user?.id) return;

        socket.emit("join", user.id);

        const handlePrivateMessage = (msg, senderInfo) => {
            const senderId = msg.sender_id || msg.senderId;
            const receiverId = msg.receiver_id || msg.receiverId;

            if (
                (Number(senderId) === Number(friend.id) && Number(receiverId) === Number(user.id)) ||
                (Number(senderId) === Number(user.id) && Number(receiverId) === Number(friend.id))
            ) {
                setChat(prev => [...prev, { ...msg, sender: senderInfo }]);

                // Nếu đang minimize và là tin nhắn từ đối phương → mở to
                if (isMinimized && Number(senderId) === Number(friend.id)) {
                    onToggleMinimize(); // mở to
                }

                // Chỉ setHasUnread nếu là tin từ đối phương
                if (Number(senderId) === Number(friend.id)) {
                    setHasUnread(true);
                }
            }
        };

        const handleMessageRead = ({ readerId, image_url }) => {
            setChat(prev =>
                prev.map(msg =>
                    Number(msg.sender_id) === Number(user.id) &&
                    Number(msg.receiver_id) === Number(readerId)
                    ? {
                        ...msg,
                        is_read: true,
                        sender: {
                            ...msg.sender,
                            image_url: image_url // cập nhật avatar người đọc
                        }
                    }
                    : msg
                )
            );
        };
        const handleImageMessage = (data) => {
            const { id, senderId, receiverId, imageUrl, createdAt, senderInfo } = data;

            if (
                (senderId == user.id && receiverId == friend.id) ||
                (senderId == friend.id && receiverId == user.id)
            ) {
                setChat(prev => {
                    const exists = prev.some(msg => msg.id === id);
                    if (exists) return prev;

                    return [
                        ...prev,
                        {
                            id,
                            sender_id: senderId,
                            receiver_id: receiverId,
                            image_url: imageUrl,
                            content: null,
                            is_read: false,
                            created_at: createdAt || new Date().toISOString(),
                            sender: {
                                id: senderId,
                                image_url: senderInfo?.image_url || null
                            }
                        }
                    ];
                });
            }
        };

        const handleVideoMessage = (data) => {
            const { senderId, receiverId, videoUrl, videoName, videoSize, createdAt } = data;
            if (
                (senderId == user.id && receiverId == friend.id) ||
                (senderId == friend.id && receiverId == user.id)
            ) {
                setChat(prev => [...prev, {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    video_url: videoUrl,
                    video_name: videoName,
                    video_size: videoSize,
                    content: null,
                    is_read: senderId == user.id,
                    created_at: createdAt || new Date().toISOString(),
                }]);
            }
        };

        socket.on("private_message", handlePrivateMessage);
        socket.on("messages_read", handleMessageRead);
        socket.on("send_image_message", (message, senderInfo) => {
            handleImageMessage({
                ...message,
                senderInfo: senderInfo || null  
            });
        });
        socket.on("send_video_message", handleVideoMessage);
        return () => {
            socket.off("private_message", handlePrivateMessage);
            socket.off("messages_read", handleMessageRead);
            socket.off("send_image_message", handleImageMessage);
            socket.off("send_video_message", handleVideoMessage);
        };
    }, [user?.id, friend?.id]);

    if (loading)
        return (
            <div className="w-80 h-[500px] bg-white shadow-xl rounded-lg flex items-center justify-center">
                <ChatLoading />
            </div>
        );

    return (
        <div
            onClick={handleChatBoxClick}
            className={`bg-white shadow-2xl rounded-t-lg flex flex-col transition-all duration-300
                        ${isMinimized ? "w-80 h-12" : "w-80 h-[500px]"}
                        ${hasUnread ? "ring-4 ring-blue-500" : ""}`}
        >
            <div
                className={`flex items-center justify-between p-3 border-b transition-all duration-300
                    ${hasUnread ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
            >
                <div
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMinimize(!isMinimized);
                    }}
                >
                    <div className="relative">
                        <img
                            src={friend.image_url ? src + friend.image_url : "https://cdn-icons-png.flaticon.com/512/4825/4825038.png"}
                            alt={friend.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        {friend.is_online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{friend.name}</span>
                            {hasUnread && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                        </div>
                        {friend.is_online && <span className="text-xs text-gray-500">Đang hoạt động</span>}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            startCall(friend.id);
                        }}
                    >
                        <Phone size={16} />
                    </button>

                    <button
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            videoCall(friend.id);
                        }}
                    >
                        <Video size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleMinimize(!isMinimized);
                        }}
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full"
                    >
                        <Minus size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeChat(friend.id);
                        }}
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
                <>
                    <div className="flex-1 p-3 overflow-y-auto bg-white">
                        <ChatList chat={chat} user={user} messagesEndRef={messagesEndRef} friend={friend} />
                    </div>

                    <MessageInput
                        userId={user.id}
                        receiverId={friend.id}
                        setChat={setChat}
                        setHasUnread={setHasUnread}
                        onMessageSent={() => messagesEndRef.current?.scrollIntoView()}
                    />
                </>
            )}
        </div>
    );
}
