export const playNotificationSound = (notificationAudioRef) => {
    if (notificationAudioRef.current) {
        notificationAudioRef.current.currentTime = 0;
        notificationAudioRef.current.play().catch(() => {});
    }
};

// Handler cho tin nhắn text 1-1
export const handlePrivateMessage = (
    msg, 
    senderInfo, 
    profile, 
    openChatsRef, 
    setOpenChats, 
    notificationAudioRef
) => {
    if (Number(msg.receiver_id) !== Number(profile.id)) return;

    const isChatOpen = openChatsRef.current.some(
        chat => !chat.isGroup && Number(chat.id) === Number(msg.sender_id)
    );

    if (!isChatOpen) {
        const friendData = {
            id: msg.sender_id,
            name: senderInfo.name || senderInfo.username || 'Unknown',
            image_url: senderInfo.image_url || null,
            isGroup: false,
            isMinimized: true
        };
        setOpenChats(prev => 
            prev.length >= 3 
                ? [
                    ...prev.slice(1), 
                    friendData
                ] 
                : 
                [
                    ...prev, 
                    friendData
                ]
        );
    }

    playNotificationSound(notificationAudioRef);
};