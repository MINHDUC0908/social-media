// utils/socket.js
const { Server } = require("socket.io");
const { User } = require("../app/model");
const CallService = require("../app/service/CallService");
const initChatHandlers = require("./socketHandlers/chatHandler");
const initGroupHandlers = require("./socketHandlers/groupHandler");
const initGroupCallHandlers = require("./socketHandlers/groupCallHandler");
const path = require("path");
const fs = require("fs").promises;
const { encryptFile } = require("./encryption");    

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(" New client connected: ", socket.id);

        // Nhắn tin riêng tư
        initChatHandlers(io, socket);

        // Nhóm chat
        initGroupHandlers(io, socket);

        // Nhóm gọi video/voice
        initGroupCallHandlers(socket, io);

        // Nhận tín hiệu gọi
        socket.on("call-user", async ({ senderId, receiverId, offer, type }) => {
            try {
                // Nếu type không truyền, mặc định 'voice'
                const call = await CallService.startCall(senderId, receiverId, type, "missed", 0);

                io.to(`user_${receiverId}`).emit("incoming-call", { 
                    from: senderId, 
                    offer, 
                    callId: call.id 
                });
            } catch (err) {
                socket.emit("call-error", { message: err.message });
            }
        });

        // Gửi lại answer
        socket.on("answer-call", ({ senderId, receiverId, answer }) => {
            // Gửi answer về cho người gọi
            io.to(`user_${senderId}`).emit("call-answered", { 
                from: receiverId, 
                answer: answer 
            });
        });

        // Gửi ICE candidate
        socket.on("ice-candidate", ({ senderId, receiverId, candidate }) => {
            console.log(` ICE candidate from ${senderId} to ${receiverId}`);
            // Gửi ICE candidate cho đối phương
            io.to(`user_${receiverId}`).emit("ice-candidate", { 
                from: senderId,
                candidate: candidate 
            });
        });

        // Ngắt cuộc gọi
        socket.on("end-call", ({ senderId, receiverId }) => {
            console.log(` Call ended between ${senderId} and ${receiverId}`);
            io.to(`user_${receiverId}`).emit("call-ended", { from: senderId });
            io.to(`user_${senderId}`).emit("call-ended", { from: receiverId });
        });



        // Nhận tín hiệu gọi VIDEO
        socket.on("call-video-user", ({ senderId, receiverId, offer }) => {
            console.log(` VIDEO Call from user ${senderId} to user ${receiverId}`);
            io.to(`user_${receiverId}`).emit("incoming-video-call", { 
                from: senderId, 
                offer: offer 
            });
        });

        // Gửi lại answer VIDEO
        socket.on("answer-video-call", ({ senderId, receiverId, answer }) => {
            console.log(` User ${receiverId} answered VIDEO call from ${senderId}`);
            io.to(`user_${senderId}`).emit("video-call-answered", { 
                from: receiverId, 
                answer: answer 
            });
        });

        // Gửi ICE candidate VIDEO
        socket.on("video-ice-candidate", ({ senderId, receiverId, candidate }) => {
            console.log(`VIDEO ICE candidate from ${senderId} to ${receiverId}`);
            io.to(`user_${receiverId}`).emit("video-ice-candidate", { 
                from: senderId,
                candidate: candidate 
            });
        });

        // Ngắt cuộc gọi VIDEO
        socket.on("end-video-call", ({ senderId, receiverId }) => {
            console.log(`VIDEO Call ended between ${senderId} and ${receiverId}`);
            io.to(`user_${receiverId}`).emit("video-call-ended", { from: senderId });
            io.to(`user_${senderId}`).emit("video-call-ended", { from: receiverId });
        });


        // Nhận và mã hóa FILE
        socket.on('send_file', async (data) => {
            try {
                const { senderId, receiverId, fileBuffer, fileName, fileType, fileSize, senderInfo } = data;

                // Convert base64 to Buffer
                const buffer = Buffer.from(fileBuffer, 'base64');

                // MÃ HÓA file
                const { iv, encryptedData } = encryptFile(buffer);

                // Lưu file đã mã hóa
                const uploadDir = path.join(__dirname, '../../uploads/encrypted');
                await fs.mkdir(uploadDir, { recursive: true });

                const encryptedFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.enc`;
                const filePath = path.join(uploadDir, encryptedFileName);
                
                await fs.writeFile(filePath, encryptedData);

                // Tạo message object
                const fileMessage = {
                    id: Date.now(),
                    sender_id: senderId,
                    receiver_id: receiverId,
                    file_url: `/uploads/encrypted/${encryptedFileName}`,
                    file_iv: iv,
                    file_name: fileName,
                    file_type: fileType,
                    file_size: fileSize,
                    is_encrypted: true,
                    is_read: false,
                    created_at: new Date().toISOString()
                };

                // Lưu vào database (nếu có)
                // await saveMessageToDB(fileMessage);

                // Gửi đến người nhận và người gửi
                io.to(`user_${receiverId}`).emit('send_file_message', fileMessage, senderInfo);
                io.to(`user_${senderId}`).emit('send_file_message', fileMessage, senderInfo);

                console.log('✅ Encrypted file sent:', encryptedFileName);
            } catch (error) {
                console.error('Send encrypted file error:', error);
                socket.emit('error', { message: 'Failed to send encrypted file' });
            }
        });

        socket.on("disconnect", async () => {
            if (socket.userId) {
                const now = new Date();
                await User.update(
                    { is_online: false, last_active: now },
                    { where: { id: socket.userId } }
                );
                io.emit("user_status_change", {
                    userId: socket.userId,
                    isOnline: false,
                    lastActive: now,
                });
            }
        });
    });
    return io;
}

module.exports = { initSocket, getIO: () => io };
