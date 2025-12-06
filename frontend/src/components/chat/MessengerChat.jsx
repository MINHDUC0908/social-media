import { X, Minus, Phone, Video } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import socket from '../../utils/socket';
import useChat from '../../hooks/useChat';
import ChatList from './ChatList';
import src from '../../api/src';
import ChatLoading from '../ui/ChatLoading';
import MessageInput from './MessageInput';

export function ChatBox({ friend, closeChat, user, startCall, videoCall }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const { chat, setChat, fetchMessages, loading } = useChat()
    const [hasUnread, setHasUnread] = useState(false)
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);
    // Ref để tránh stale closure trong listener
    const isMinimizedRef = useRef(isMinimized);
    const hasUnreadRef = useRef(hasUnread);

    useEffect(() => {
        isMinimizedRef.current = isMinimized;
    }, [isMinimized]);
    
    useEffect(() => {
        hasUnreadRef.current = hasUnread;
    }, [hasUnread]);
    
    // Fetch tin nhắn khi mở chat
    useEffect(() => {
        if (friend?.id && user?.id) {
            fetchMessages(friend.id);
            // Reset trạng thái khi đổi người chat
            setHasUnread(false);
            setIsMinimized(false);
        }
    }, [friend]); 
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [chat]);

    // ✨ Kiểm tra tin nhắn chưa đọc
    useEffect(() => {
        if (!chat || chat.length === 0 || !user?.id || !friend?.id) return;
        
        const unreadMessages = chat.filter(
            msg => Number(msg.sender_id) === Number(friend.id) && 
                   Number(msg.receiver_id) === Number(user.id) && 
                   !msg.is_read
        );
        
        const hasUnreadNow = unreadMessages.length > 0;
        setHasUnread(hasUnreadNow);
    }, [chat, friend?.id, user?.id]);

    // Thu gọn / mở rộng chat
    const minimizeChat = () => {
        setIsMinimized(!isMinimized);
    };

    // ✨ Đánh dấu đã đọc khi click vào chat box
    const handleChatBoxClick = () => {
        if (!user || !friend?.id) return;
        
        if (hasUnread) {
            socket.emit("mark_as_read", {
                userId: parseInt(user.id),
                senderId: parseInt(friend.id),
            });

            setChat((prevChat) =>
                prevChat.map((msg) =>
                    Number(msg.sender_id) === Number(friend.id) && Number(msg.receiver_id) === Number(user.id)
                        ? { ...msg, is_read: true }
                        : msg
                )
            );
            
            setHasUnread(false);
        }
    };

    useEffect(() => {
        if (!user || !friend) return;

        socket.emit("join", user.id);

        const handlePrivateMessage = (msg, senderInfo) => {
            console.log('📨 Nhận tin nhắn mới:', msg);
            
            if (
                (Number(msg.sender_id) === Number(user.id) && Number(msg.receiver_id) === Number(friend.id)) ||
                (Number(msg.sender_id) === Number(friend.id) && Number(msg.receiver_id) === Number(user.id))
            ) {
                msg.sender = senderInfo;
                setChat((prev) => [...prev, msg]);
                
                // TỰ ĐỘNG EXPAND NẾU ĐANG MINIMIZE VÀ LÀ TIN NHẮN ĐẾN
                if (isMinimizedRef.current && Number(msg.sender_id) === Number(friend.id)) {
                    setIsMinimized(false);
                }
                
                // NẾU LÀ TIN NHẮN ĐẾN VÀ CHƯA ĐỌC → BẬT VIỀN XANH
                if (Number(msg.sender_id) === Number(friend.id) && !msg.is_read) {
                    setHasUnread(true);
                }
            }
        };

        const handleMessageRead = ({ readerId, senderId, image_url }) => {
            setChat(prevChat =>
                prevChat.map(msg => {
                    // Tin nhắn từ mình gửi đi, và người kia vừa đọc
                    if (Number(msg.sender_id) === Number(user.id) && 
                        Number(msg.receiver_id) === Number(readerId)) {
                        return {
                            ...msg,
                            is_read: true,
                            // Cập nhật avatar của người nhận (người vừa đọc)
                            sender: {
                                ...msg.sender,
                                image_url: image_url
                            }
                        };
                    }
                    return msg;
                })
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
    }, [user, friend?.id]);

    if (loading) return (
        <div className="w-80 h-[500px] bg-white shadow-xl rounded-lg flex items-center justify-center">
            <ChatLoading />
        </div>
    );

    return (
        <div 
            ref={chatBoxRef}
            onClick={handleChatBoxClick}
            className={`bg-white shadow-2xl rounded-t-lg flex flex-col transition-all duration-300 cursor-pointer
                        ${isMinimized ? 'w-80 h-12' : 'w-80 h-[500px]'}
                        ${hasUnread ? 'ring-4 ring-blue-500 ring-offset-0' : ''}`}
            style={{ 
                boxShadow: hasUnread 
                    ? '0 -2px 20px rgba(59, 130, 246, 0.5), 0 0 0 4px rgb(59 130 246)' 
                    : '0 -2px 20px rgba(0,0,0,0.15)'
            }}
        >
            {/* Header */}
            <div className={`flex items-center justify-between p-3 border-b rounded-t-lg transition-all duration-300
                            ${hasUnread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        minimizeChat();
                    }}
                >
                    <div className="relative">
                        <img 
                            src={friend.image_url == null ? "https://cdn-icons-png.flaticon.com/512/4825/4825038.png" : src + friend.image_url}
                            alt={friend.name} 
                            className="w-8 h-8 rounded-full object-cover" 
                        />
                        {friend.is_online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{friend.name}</span>
                            {hasUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        {friend.is_online && <span className="text-xs text-gray-500">Đang hoạt động</span>}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            startCall(friend.id);
                        }}
                    >
                        <Phone size={16} />
                    </button>
                    <button 
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full transition"
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
                            minimizeChat();
                        }}
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full transition"
                    >
                        <Minus size={16} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            closeChat(friend.id);
                        }}
                        className="text-blue-500 hover:bg-gray-100 p-1.5 rounded-full transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages & Input */}
            {!isMinimized && (
                <>
                    <div className="flex-1 p-3 overflow-y-auto bg-white">
                        <ChatList
                            chat={chat} 
                            user={user} 
                            messagesEndRef={messagesEndRef} 
                            friend={friend} 
                        />
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