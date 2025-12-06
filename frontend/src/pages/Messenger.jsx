import { useEffect, useState } from "react";
import src from "../api/src";
import useUser from "../hooks/useUser";
import { useAuth } from "../contexts/AuthContext";
import socket from "../utils/socket";
import { formatLastActive } from "../utils/format";
import { FiEdit2 } from "react-icons/fi";
import CreateGroup from "../components/groups/creatGroup";
import axios from "axios";
import api from "../api/api";

function Messenger({ openChatWith }) {
    const { conversations, fetchConversations, setConversations } = useUser();
    const { user } = useAuth();
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [friends, setFriends] = useState([]);

    // Load conversations + join socket
    useEffect(() => {
        const init = async () => {
            await fetchConversations();

            if (user?.id) {
                socket.emit("user_online", user.id);
                socket.emit("join", user.id);
            }
        };
        init();
    }, [user?.id]);

    // Join groups after conversations loaded
    useEffect(() => {
        if (conversations.length > 0 && user?.id) {
            conversations.forEach((conv) => {
                if (conv.isGroup === 1 || conv.isGroup === true) {
                    const groupId = conv.conversationId || conv.id || conv.chatId;
                    socket.emit("join_group", { groupId });
                }
            });
        }
    }, [conversations.length, user?.id]);

    //  Socket listeners
    useEffect(() => {
        if (!user?.id) return;

        // --- Private message ---
        const handlePrivateMessage = (msg) => {
            const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            const isMyMessage = msg.sender_id === user.id;

            setConversations((prev) => {
                const index = prev.findIndex((c) => {
                    if (c.isGroup) return false;
                    return Number(c.id) === Number(otherUserId);
                });

                if (index !== -1) {
                    const old = prev[index];
                    const updated = [...prev];
                    updated.splice(index, 1);

                    const newConv = {
                        ...old,
                        lastMessage: msg.content,
                        lastTime: msg.created_at || new Date().toISOString(),
                        lastSenderId: msg.sender_id,
                        unreadCount: isMyMessage ? old.unreadCount : (Number(old.unreadCount) || 0) + 1,
                        is_read: msg.is_read
                    };
                    return [newConv, ...updated];
                }
                return prev;
            });
        };

        // Gửi ảnh
        const handlePrivateMessageImage = (msg) => {
            const otherUserId = parseInt(
                msg.senderId === user?.id ? msg.receiverId : msg.senderId
            );
            const isMyMessage = msg.senderId === user?.id;

            setConversations((prev) => {
                const existingIndex = prev.findIndex((c) => {
                    if (c.isGroup === 1 || c.isGroup === true) return false;
                    const convId = parseInt(c.id);
                    return convId === otherUserId;
                });

                if (existingIndex !== -1) {
                    const exists = prev[existingIndex];
                    const updated = [...prev];
                    updated.splice(existingIndex, 1);
                    const newConv = {
                        ...exists,
                        lastMessage: "📷 Đã gửi 1 ảnh",
                        lastTime: msg.createdAt || new Date().toISOString(),
                        lastSenderId: msg.senderId,
                        unreadCount: isMyMessage
                            ? exists.unreadCount
                            : (parseInt(exists.unreadCount) || 0) + 1,
                    };

                    return [newConv, ...updated];
                }
                return prev;
            });
        }; 

        // --- Nhóm mới tạo ---
        const handleGroupCreated = (newGroup) => {
            const normalizedGroup = {
                ...newGroup,
                chatId: newGroup.id,
                conversationId: newGroup.id,
                conversationName: newGroup.name,
                displayName: newGroup.name || "Nhóm không tên",
                displayMessage: newGroup.lastMessage || "Chưa có tin nhắn",
                avatar: newGroup.avatar || "/group-icon.png",
                unreadCount: 0,
                isGroup: 1,
                lastTime: new Date().toISOString(),
            };
            setConversations((prev) => [normalizedGroup, ...prev]);
            socket.emit("join_group", { groupId: newGroup.id });
        };

        const handleGroupMessageUpdate = (...args) => {
            let data = args[0];
            if (Array.isArray(data)) {
                data = data[0];
            }
            setConversations((prev) => {
                const existingIndex = prev.findIndex((c) => {
                    const isGroupConv = c.isGroup === 1 || c.isGroup === true;
                    if (!isGroupConv) return false;
                    const groupId = parseInt(c.conversationId || c.id || c.chatId);
                    return groupId === parseInt(data.groupId);
                });
                
                if (existingIndex !== -1) {
                    const exists = prev[existingIndex];
                    const updated = [...prev];
                    updated.splice(existingIndex, 1);

                    const updatedConv = {
                        ...exists,
                        lastMessage: data.content,
                        lastTime: data.createdAt || new Date().toISOString(),
                        lastSenderId: data.senderId,
                        name: data.senderInfo?.name
                    };
                    
                    return [updatedConv, ...updated];
                }
                return prev;
            });
        };

        // XỬ LÝ KHI TIN NHẮN ĐƯỢC ĐỌC - CẬP NHẬT CHO MESSENGER
        const handleMessageRead = ({ readerId, senderId, image_url }) => {
            setConversations((prev => 
                prev.map((conv) => {
                    if (conv.isGroup) return conv;
                    // Trường hợp: Người kia đọc tin nhắn của mình → conv.id = readerId
                    if (Number(senderId) === Number(user?.id) && Number(conv.id) === Number(readerId)) {
                        return {
                            ...conv,
                            is_read: true,
                            unreadCount: "",
                            image_url: image_url || conv.image_url 
                        };
                    }

                    // Trường hợp: Mình đọc tin nhắn của người kia → conv.id = senderId
                    if (Number(readerId) === Number(user?.id) && Number(conv.id) === Number(senderId)) {
                        return {
                            ...conv,
                            is_read: true,
                            unreadCount: "",
                            // Không cần cập nhật image_url ở đây vì đã đúng rồi
                        };
                    }

                    return conv;
                })
            ));
        };

        socket.on("private_message", handlePrivateMessage);
        socket.on("group_created", handleGroupCreated);
        socket.on("group_message", handleGroupMessageUpdate);
        socket.on("send_image_message", handlePrivateMessageImage);
        socket.on("messages_read", handleMessageRead);

        return () => {
            socket.off("private_message", handlePrivateMessage);
            socket.off("group_created", handleGroupCreated);
            socket.off("group_message", handleGroupMessageUpdate);
            socket.off("send_image_message", handlePrivateMessageImage);
            socket.off("messages_read", handleMessageRead);
        };
    }, [user?.id, setConversations]);

    const normalizedConversations = conversations.map((c) => ({
        ...c,
        chatId: c.isGroup ? c.conversationId : c.id,
        displayName: c.isGroup ? c.conversationName || "Nhóm không tên" : c.name || "Người dùng không tên",
        displayMessage: c.lastMessage || "Chưa có tin nhắn",
        avatar:
            c.avatar ||
            (c.isGroup ? "/group-icon.png" : `https://i.pravatar.cc/50?u=${c.id}`),
        isOnline: c.isGroup ? null : Boolean(c.isOnline ?? c.is_online),
        unreadCount: c.isGroup ? 0 : c.unreadCount,
        name: c.name,
        lastActive: c.lastActive ? new Date(c.lastActive) : null,
        is_read: c.is_read
    }));

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await axios.get(api + "friends/accepted", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setFriends(res.data.data);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };
        fetchFriends();
    }, []);

    // Hàm xử lý khi click vào conversation
    const handleConversationClick = (friend) => {
        // Kiểm tra xem có tin nhắn chưa đọc không
        const isReceiverOfLastMessage = friend.lastSenderId && Number(friend.lastSenderId) !== Number(user?.id);
        const hasUnreadMessages = isReceiverOfLastMessage && (
            (friend.is_read === false || friend.is_read === 0) ||
            (friend.unreadCount && Number(friend.unreadCount) > 0)
        );

        // Nếu có tin nhắn chưa đọc, emit mark_as_read
        if (hasUnreadMessages && !friend.isGroup) {
            socket.emit("mark_as_read", {
                userId: parseInt(user.id),
                senderId: parseInt(friend.id),
            });

            // Cập nhật state ngay lập tức
            setConversations((prev) => 
                prev.map((conv) => {
                    if (!conv.isGroup && Number(conv.id) === Number(friend.id)) {
                        return {
                            ...conv,
                            is_read: true,
                            unreadCount: ""
                        };
                    }
                    return conv;
                })
            );
        }
        // Mở chat
        openChatWith(friend);
    };

    return (
        <div className="mx-auto relative">
            <div className="bg-white shadow-lg p-4">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Tin nhắn</h2>
                    <FiEdit2 
                        onClick={() => setShowCreateGroup(true)}
                        className="hover:scale-110 transition-transform cursor-pointer text-xl" 
                    /> 
                </div>
                <div className="space-y-3">
                    {normalizedConversations.map((friend) => {
                        const isReceiverOfLastMessage = friend.lastSenderId && Number(friend.lastSenderId) !== Number(user?.id);
                        const isUnread = isReceiverOfLastMessage && (friend.is_read === false || friend.is_read === 0);
                        const hasUnreadCount = isReceiverOfLastMessage && friend.unreadCount && Number(friend.unreadCount) > 0;
                        return (
                            <div
                                key={friend.id}
                                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isUnread || hasUnreadCount
                                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleConversationClick(friend)}
                            >
                                <div className="relative">
                                    <img
                                        src={friend.image_url ? src + friend.image_url : "https://cdn-icons-png.flaticon.com/512/4825/4825038.png"}
                                        className={`w-14 h-14 rounded-full object-cover ${
                                            isUnread || hasUnreadCount ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                        }`}
                                    />
                                    {friend.is_online && (
                                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`font-semibold text-gray-900 ${
                                            isUnread || hasUnreadCount ? 'font-bold' : ''
                                        }`}>
                                            {friend.displayName ? friend.displayName : friend.conversationName}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs ${
                                                isUnread || hasUnreadCount ? 'text-blue-600 font-semibold' : 'text-gray-400'
                                            }`}>
                                                {formatLastActive(friend.lastActive)}
                                            </span>
                                            {hasUnreadCount && (
                                                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                                    {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {friend.displayMessage === "Chưa có tin nhắn" ? (
                                                <p className="text-sm text-gray-500 truncate">Chưa có tin nhắn</p>
                                            ) : friend.isGroup ? (
                                                Number(friend.lastSenderId) === Number(friend.id) ? (
                                                    <p className={`text-sm truncate ${
                                                        isUnread || hasUnreadCount ? 'text-gray-900 font-semibold' : 'text-gray-500'
                                                    }`}>
                                                        Bạn: {friend.displayMessage}
                                                    </p>
                                                ) : (
                                                    <p className={`text-sm truncate ${
                                                        isUnread || hasUnreadCount ? 'text-gray-900 font-semibold' : 'text-gray-500'
                                                    }`}>
                                                        {friend.name}: {friend.displayMessage}
                                                    </p>
                                                )
                                            ) : friend.lastSenderId == friend.id ? (
                                                <p className={`text-sm truncate ${
                                                    isUnread || hasUnreadCount ? 'text-gray-900 font-semibold' : 'text-gray-500'
                                                }`}>
                                                    {friend.displayMessage}
                                                </p>
                                            ) : (
                                                <p className={`text-sm truncate ${
                                                    isUnread || hasUnreadCount ? 'text-gray-900 font-semibold' : 'text-gray-500'
                                                }`}>
                                                    Bạn: {friend.displayMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {showCreateGroup && ( <CreateGroup setShowCreateGroup={setShowCreateGroup} friends={friends} /> )}
        </div>
    );
}

export default Messenger; 