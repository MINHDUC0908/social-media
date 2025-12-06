const CallService = require("../../app/service/CallService");

function initAudiiocall(io, socket) {
    // 📞 Nhận tín hiệu gọi
    socket.on("call-user", async ({ senderId, receiverId, offer, type }) => {
        try {
            // Nếu type không truyền, mặc định 'voice'
            const call = await CallService.startCall(senderId, receiverId, type, "missed", 0);
            console.log("✅ Call saved:", call.id);

            io.to(`user_${receiverId}`).emit("incoming-call", { 
                from: senderId, 
                offer, 
                callId: call.id 
            });
        } catch (err) {
            console.error("❌ Lỗi khi lưu cuộc gọi:", err);
            socket.emit("call-error", { message: err.message });
        }
    });

    // ✅ Gửi lại answer
    socket.on("answer-call", ({ senderId, receiverId, answer }) => {
        console.log(`✅ User ${receiverId} answered call from ${senderId}`);
        // Gửi answer về cho người gọi
        io.to(`user_${senderId}`).emit("call-answered", { 
            from: receiverId, 
            answer: answer 
        });
    });

    // 🧊 Gửi ICE candidate
    socket.on("ice-candidate", ({ senderId, receiverId, candidate }) => {
        console.log(`🧊 ICE candidate from ${senderId} to ${receiverId}`);
        // Gửi ICE candidate cho đối phương
        io.to(`user_${receiverId}`).emit("ice-candidate", { 
            from: senderId,
            candidate: candidate 
        });
    });

    // 📴 Ngắt cuộc gọi
    socket.on("end-call", ({ senderId, receiverId }) => {
        console.log(`📴 Call ended between ${senderId} and ${receiverId}`);
        io.to(`user_${receiverId}`).emit("call-ended", { from: senderId });
        io.to(`user_${senderId}`).emit("call-ended", { from: receiverId });
    });
}

module.exports = initAudiiocall;