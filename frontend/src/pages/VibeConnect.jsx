import { useState, useEffect, useRef } from 'react';
import HomePage from './Home';
import Friend from './Friend';
import Group from './Group';
import Messenger from './Messenger';
import Notification from './Notification';
import Profile from './Profile';
import { useAuth } from '../contexts/AuthContext';
import { ChatBox } from '../components/chat/MessengerChat';
import { GroupChatBox } from '../components/groups/GroupChatBox';
import AudioCall from '../components/AudioCallPrivate';
import VideoCall from '../components/VideoCallPrivate';
import useUser from '../hooks/useUser';
import socket from '../utils/socket';
import RightSidebar from '../layouts/RightSidebar';
import Header from '../layouts/Header';
import LeftSidebar from '../layouts/LeftSidebar';
import Loading from '../components/ui/loading';
import { handlePrivateMessage } from '../../handlers/handlePrivateMessage';
import src from '../api/src';
import AudioGroup from '../components/AudioGroup';

function VibeConnect() {
    const audioCallRef = useRef(null);
    const videoCallRef = useRef(null);
    const groupCallRef = useRef(null);

    const notificationAudioRef = useRef(null);
    const openChatsRef = useRef([]);

    const { user } = useAuth();
    const { profile, setProfile, loading, conversations, fetchConversations, setConversations } = useUser();

    const [currentPage, setCurrentPage] = useState(() => window.location.hash.slice(1) || 'home');
    
    // Load openChats từ localStorage khi khởi động
    const [openChats, setOpenChats] = useState(() => {
        try {
            const saved = localStorage.getItem('openChats');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Lưu openChats vào localStorage mỗi khi thay đổi
    useEffect(() => {
        try {
            localStorage.setItem('openChats', JSON.stringify(openChats));
        } catch (error) {
            console.error(' Lỗi khi lưu localStorage:', error);
        }
    }, [openChats]);

    // Đồng bộ openChats ref
    useEffect(() => {
        openChatsRef.current = openChats;
    }, [openChats]);

    const navigateTo = (page) => {
        setCurrentPage(page);
        window.location.hash = page;
    };

    useEffect(() => {
        const handleHashChange = () => setCurrentPage(window.location.hash.slice(1) || 'home');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Unlock notification audio
    useEffect(() => {
        notificationAudioRef.current = new Audio('/sounds/doraemon.mp3');
        notificationAudioRef.current.volume = 0.7;
        notificationAudioRef.current.load();

        const unlockAudio = async () => {
            try {
                notificationAudioRef.current.volume = 0;
                await notificationAudioRef.current.play();
                notificationAudioRef.current.pause();
                notificationAudioRef.current.currentTime = 0;
                notificationAudioRef.current.volume = 0.7;
            } catch {}
        };

        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });

        return () => {
            if (notificationAudioRef.current) notificationAudioRef.current.pause();
        };
    }, []);

    // Mở chat modal
    const openChatWith = (conversation) => {
        if (conversation.isGroup) {
            conversation.id = conversation.groupId || conversation.conversationId || conversation.chatId;
        }
        setOpenChats(prev => {
            const exists = prev.find(c => Number(c.id) === Number(conversation.id));
            if (exists) {
                const others = prev.filter(c => Number(c.id) !== Number(conversation.id));
                return [...others, { ...exists, isMinimized: false }];
            }
            const newChat = { ...conversation, isMinimized: false };
            return prev.length < 3 ? [...prev, newChat] : [...prev.slice(1), newChat];
        });
    };

    const closeChat = (id) => {
        setOpenChats(prev => prev.filter(c => Number(c.id) !== Number(id)));
    };

    // Fetch conversations và join groups
    useEffect(() => {
        if (profile?.id) {
            fetchConversations();
        }
    }, [profile?.id]);

    useEffect(() => {
        if (conversations.length > 0 && profile?.id) {
            conversations.forEach((conv) => {
                if (conv.isGroup === 1 || conv.isGroup === true) {
                    const groupId = conv.conversationId || conv.id || conv.chatId;
                    socket.emit("join_group", { groupId });
                }
            });
        }
    }, [conversations.length, profile?.id]);

    // Socket listeners
    useEffect(() => {
        if (!profile?.id) return;

        socket.emit('join', profile.id);

        // --- Handler cho tin nhắn 1-1 ---
        const onPrivateMessage = (msg, senderInfo) => {
            handlePrivateMessage(msg, senderInfo, profile, openChatsRef, setOpenChats, notificationAudioRef);
            setConversations(prev =>
                    prev.map(conv => {
                        if (!conv.isGroup && Number(conv.id) === Number(msg.sender_id)) {
                            return {
                                ...conv,
                                unreadCount: (conv.unreadCount || 0) + 1,
                                is_read: false
                            };
                        }
                        return conv;
                    })
                );
        };

        const handlePrivateMessageImage = (msg, senderInfo) => {
            const receiverId = msg.receiver_id || msg.receiverId;
            const senderId = msg.sender_id || msg.senderId;
            if (Number(receiverId) !== Number(profile.id)) return;
            
            const isChatOpen = openChatsRef.current.some(
                chat => !chat.isGroup && Number(chat.id) === Number(senderId)
            );
            // Nếu chưa mở modal thì mở
            if (!isChatOpen) {
                const friendData = {
                    id: senderId,
                    name: senderInfo?.name || senderInfo?.username || "Unknown",
                    image_url: senderInfo?.image_url || null,
                    isGroup: false,
                    isMinimized: false,
                };

                setOpenChats(prev =>
                    prev.length >= 3
                        ? [...prev.slice(1), friendData]
                        : [...prev, friendData]
                );
            }
            if (notificationAudioRef.current) {
                notificationAudioRef.current.currentTime = 0;
                notificationAudioRef.current.play().catch(() => {});
            }
        };

        // --- Handler cho tin nhắn nhóm ---
        const handleGroupMessage = (...args) => {
            let data = args[0];
            if (Array.isArray(data)) {
                data = data[0];
            }

            if (data.senderId && Number(data.senderId) === Number(profile.id)) {
                return;
            }

            const groupId = data.groupId || data.conversationId || data.chatId;

            const isChatOpen = openChatsRef.current.some(chat => {
                if (!chat.isGroup) return false;
                const chatGroupId = chat.id || chat.conversationId || chat.groupId || chat.chatId;
                return Number(chatGroupId) === Number(groupId);
            });

            if (!isChatOpen) {
                const groupInfo = conversations.find(conv => {
                    if (!conv.isGroup) return false;
                    const convGroupId = conv.conversationId || conv.id || conv.chatId;
                    return Number(convGroupId) === Number(groupId);
                });

                const groupData = {
                    id: groupId,
                    conversationId: groupId,
                    groupId: groupId,
                    conversationName: groupInfo?.conversationName || data.groupName || 'Nhóm',
                    name: groupInfo?.name || data.groupName || 'Nhóm',
                    avatar: groupInfo?.avatar || data.groupAvatar || '/group-icon.png',
                    memberCount: groupInfo?.memberCount || data.memberCount || 0,
                    isGroup: true,
                    isMinimized: true // Mặc định minimize khi có tin nhắn mới
                };
                
                setOpenChats(prev => {
                    if (prev.length >= 3) {
                        return [...prev.slice(1), groupData];
                    }
                    return [...prev, groupData];
                });
            }
            if (notificationAudioRef.current) {
                notificationAudioRef.current.currentTime = 0;
                notificationAudioRef.current.play().catch(() => {});
            }
        };

        const handleMessageRead = ({ readerId, senderId, image_url }) => {
            setConversations((prev) => 
                prev.map((conv) => {
                    // TH1: Mình đọc tin nhắn của người khác (readerId = mình, senderId = người kia)
                    // → Cập nhật conversation với người kia (conv.id = senderId)
                    if (!conv.isGroup && Number(readerId) === Number(user?.id) && Number(conv.id) === Number(senderId)) { 
                        return {
                            ...conv,
                            is_read: true,
                            unreadCount: 0,
                            image_url: image_url || conv.image_url
                        };
                    }
                    
                    // TH2: Người khác đọc tin nhắn của mình (readerId = người kia, senderId = mình)
                    // → Cập nhật conversation với người kia (conv.id = readerId)
                    if (!conv.isGroup &&  Number(senderId) === Number(user?.id) &&  Number(conv.id) === Number(readerId)) {
                        return {
                            ...conv,
                            is_read: true,
                            unreadCount: 0,
                            image_url: image_url || conv.image_url
                        };
                    }
                    
                    return conv;
                })
            );
        };

        socket.on("messages_read", handleMessageRead);
        socket.on('private_message', onPrivateMessage);
        socket.on('group_message', handleGroupMessage);
        socket.on("send_image_message", handlePrivateMessageImage)
        return () => {
            socket.off('private_message', onPrivateMessage);
            socket.off('group_message', handleGroupMessage);
            socket.off("send_image_message", handlePrivateMessageImage)
            socket.off("messages_read", handleMessageRead);
        };
    }, [profile?.id, conversations]);

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage profile={profile} />;
            case 'friends': return <Friend />;
            case 'groups': return <Group />;
            case 'messages': return <Messenger openChatWith={openChatWith} />;
            case 'notifications': return <Notification />;
            case 'profile': return <Profile profile={profile} setProfile={setProfile} />;
            default: return <HomePage />;
        }
    };

    if (loading) return <Loading />;

    const totalUnread = conversations
        ?.filter(c => Number(c.unreadCount) > 0)
        ?.length || 0;
        
    // Hàm gọi nhóm để truyền xuống GroupChatBox
    const startGroupCall = (group) => {
        groupCallRef.current?.startGroupCall(group);
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} profile={profile} totalUnread={totalUnread} />
            <div className="max-w-7xl mx-auto px-4 py-6">
                {currentPage === 'profile' ? (
                    <div className="w-full">{renderPage()}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <LeftSidebar currentPage={currentPage} profile={profile} navigateTo={navigateTo} />
                        <main className="lg:col-span-6">{renderPage()}</main>
                        <RightSidebar />
                    </div>
                )}
            </div>
            <div className="fixed bottom-4 right-4 flex flex-row-reverse gap-3 z-50">
                {openChats
                    .filter(chat => !chat.isMinimized)
                    .map((chat, index, arr) => {
                        const isLast = index === 0; // phần tử ngoài cùng bên phải
                        return (
                            <div key={`open-${chat.id}`} className={isLast ? "mr-20" : ""}>
                                {chat.isGroup ? (
                                    <GroupChatBox
                                        group={chat}
                                        closeChat={closeChat}
                                        user={profile}
                                        startGroupCall={startGroupCall}
                                        onToggleMinimize={() => {
                                            setOpenChats(prev => prev.map(c =>
                                                c.id === chat.id ? { ...c, isMinimized: true } : c
                                            ));
                                        }}
                                    />
                                ) : (
                                    <ChatBox
                                        friend={chat}
                                        closeChat={closeChat}
                                        user={profile}
                                        startCall={(id) => audioCallRef.current?.startCall(id)}
                                        videoCall={(id) => videoCallRef.current?.startCall(id)}
                                        isMinimized={false}
                                        onToggleMinimize={() => {
                                            setOpenChats(prev => prev.map(c =>
                                                Number(c.id) === Number(chat.id)
                                                    ? { ...c, isMinimized: true }
                                                    : c
                                            ));
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
            </div>
            <div className="fixed bottom-14 right-6 flex flex-col-reverse gap-4 z-50">
                {openChats
                    .filter(chat => chat.isMinimized)
                    .map((chat, index) => (
                        <div
                            key={`mini-${chat.id}`}
                            className="relative group animate-in fade-in zoom-in duration-300"
                            style={{
                                animationDelay: `${index * 80}ms`,
                                animationFillMode: 'backwards'
                            }}
                            onClick={() => {
                                setOpenChats(prev =>
                                    prev.map(c =>
                                        Number(c.id) === Number(chat.id)
                                            ? { ...c, isMinimized: false, unreadCount: 0 }
                                            : c
                                    )
                                );
                            }}
                        >
                            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-white shadow-2xl transition-all duration-300 group-hover:ring-blue-400 cursor-pointer">
                                <img
                                    src={chat.image_url ? src + chat.image_url : "https://cdn-icons-png.flaticon.com/512/4825/4825038.png"}
                                    alt={chat.name || "User"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {chat.unreadCount > 0 && (
                                <div className="absolute -top-2 -right-2 min-w-[24px] h-8 px-2 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-white/30 animate-pulse">
                                    <span className="drop-shadow-md">
                                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                    </span>
                                    <span className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></span>
                                </div>
                            )}
                            <div className="absolute top-1/2 right-full -translate-y-1/2 mr-8 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                                <div className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl relative">
                                    {chat.name || chat.displayName}
                                    <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-3 h-3 bg-black/80 rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            <AudioCall ref={audioCallRef} user={user} />
            <VideoCall ref={videoCallRef} user={user} />
            <AudioGroup ref={groupCallRef} user={user} /> 
        </div>
    );
}

export default VibeConnect;