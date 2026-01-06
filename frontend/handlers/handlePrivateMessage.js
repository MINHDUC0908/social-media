// export const playNotificationSound = (notificationAudioRef) => {
//     if (notificationAudioRef.current) {
//         notificationAudioRef.current.currentTime = 0;
//         notificationAudioRef.current.play().catch(() => {});
//     }
// };

// // Handler cho tin nhắn text 1-1
// export const handlePrivateMessage = (
//     msg, 
//     senderInfo, 
//     profile, 
//     openChatsRef, 
//     setOpenChats, 
//     notificationAudioRef
// ) => {
//     if (Number(msg.receiver_id) !== Number(profile.id)) return;

//     const isChatOpen = openChatsRef.current.some(
//         chat => !chat.isGroup && Number(chat.id) === Number(msg.sender_id)
//     );

//     if (!isChatOpen) {
//         const friendData = {
//             id: msg.sender_id,
//             name: senderInfo.name || senderInfo.username || 'Unknown',
//             image_url: senderInfo.image_url || null,
//             isGroup: false,
//             isMinimized: true
//         };
//         setOpenChats(prev => 
//             prev.length >= 3 
//                 ? [
//                     ...prev.slice(1), 
//                     friendData
//                 ] 
//                 : 
//                 [
//                     ...prev, 
//                     friendData
//                 ]
//         );
//     }

//     playNotificationSound(notificationAudioRef);
// };


/**
 * Phát âm thanh thông báo
 */
export const playNotificationSound = (notificationAudioRef) => {
    if (notificationAudioRef?.current) {
        notificationAudioRef.current.currentTime = 0;
        notificationAudioRef.current.play().catch(() => {});
    }
};

/**
 * XỬ LÝ TIN NHẮN RIÊNG 1-1 (text, image, video, voice…)
 * 
 * Hành vi mong muốn:
 * • Lần đầu nhận tin → mở chat to luôn (không hiện hình tròn)
 * • Đã từng mở rồi và đang minimize → chỉ tăng số trên hình tròn, KHÔNG tự bật lên
 * • Click vào hình tròn mới mở to + xóa badge
 */
export const handlePrivateMessage = (
    msg,
    senderInfo,
    profile,
    openChatsRef,
    setOpenChats,
    notificationAudioRef
) => {
    // 1. Kiểm tra có phải tin nhắn gửi cho mình không
    if (Number(msg.receiver_id) !== Number(profile.id)) return;

    const senderId = Number(msg.sender_id);

    // 2. Tìm xem chat với người này đã từng được mở chưa?
    //    (có tồn tại trong mảng openChats không)
    const existingChat = openChatsRef.current.find(
        chat => !chat.isGroup && Number(chat.id) === senderId
    );

    if (!existingChat) {
        // ────────────────────────────────────────────────
        // TRƯỜNG HỢP 1: LẦN ĐẦU TIÊN nhận tin từ người này
        // → Chưa từng mở chat → MỞ TO NGAY LUÔN (không hiện hình tròn)
        // ────────────────────────────────────────────────
        const newChat = {
            id: senderId,
            name: senderInfo?.name || senderInfo?.username || "Người dùng",
            image_url: senderInfo?.image_url || null,
            isGroup: false,
            isMinimized: false,     // quan trọng: mở to luôn
            unreadCount: 0          // không có badge đỏ
        };

        setOpenChats(prev => 
            prev.length >= 3 
                ? [...prev.slice(1), newChat]   // chỉ giữ tối đa 3 chat
                : [...prev, newChat]
        );

    } else {
        // ────────────────────────────────────────────────
        // TRƯỜNG HỢP 2: ĐÃ TỪNG MỞ chat này rồi (đang mở to hoặc đang thu nhỏ)
        // → Chỉ tăng số tin nhắn chưa đọc lên, KHÔNG tự động bật chat to
        // ────────────────────────────────────────────────
        setOpenChats(prev =>
            prev.map(chat =>
                !chat.isGroup && Number(chat.id) === senderId
                    ? {
                        ...chat,
                        unreadCount: (chat.unreadCount || 0) + 1
                        // Không đụng vào isMinimized → vẫn giữ nguyên trạng thái cũ
                        // Nếu đang nhỏ → vẫn nhỏ, chỉ tăng số
                        // Nếu đang mở to → vẫn mở to (không làm phiền)
                      }
                    : chat
            )
        );
    }

    // Luôn phát âm thanh khi có tin mới
    playNotificationSound(notificationAudioRef);
};