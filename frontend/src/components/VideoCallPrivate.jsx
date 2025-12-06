import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import socket from "../utils/socket";
import { FiVideo, FiPhoneOff, FiX, FiMic, FiMicOff, FiVideoOff, FiRotateCw } from "react-icons/fi";
import useUser from "../hooks/useUser";

const VideoCall = forwardRef(({ user }, ref) => {
    const [showCallModal, setShowCallModal] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callStatus, setCallStatus] = useState("");
    const [isInCall, setIsInCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showEndCallScreen, setShowEndCallScreen] = useState(false);
    const [currentReceiverId, setCurrentReceiverId] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [currentFacingMode, setCurrentFacingMode] = useState('user');
    
    // ✅ Sử dụng ref thay vì state cho peer connection
    const pcRef = useRef(null);
    const isEndingCallRef = useRef(false);
    const callTimerRef = useRef(null);
    const callStartTimeRef = useRef(null);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pendingIceCandidatesRef = useRef([]);
    
    const { receiverInfo, fetchReceiver } = useUser();

    useEffect(() => {
        return () => {
            cleanupLocalOnly();
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, []);

    // 🎥 Setup WebRTC listeners - VIDEO EVENTS
    useEffect(() => {
        if (!user?.id) return;

        const userId = String(user.id);
        socket.emit("join", userId);

        // ✅ VIDEO: Nhận cuộc gọi đến
        socket.on("incoming-video-call", ({ from, offer }) => {
            console.log("📹 Có cuộc gọi VIDEO đến từ userId:", from);
            setIncomingCall({ from, offer });
            setCurrentReceiverId(from);
            setShowCallModal(true);
            setCallStatus(`Cuộc gọi video đến từ User ${from}`);
            isEndingCallRef.current = false;
            pendingIceCandidatesRef.current = [];
            fetchReceiver(from);
        });

        // ✅ VIDEO: Người nhận đã chấp nhận
        socket.on("video-call-answered", async ({ from, answer }) => {
            console.log("✅ User", from, "đã chấp nhận cuộc gọi video");
            setCallStatus("Đang kết nối...");
            
            if (pcRef.current) {
                try {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    console.log("✅ Đã set remote description");
                    setCallStatus("Đang gọi video");
                    
                    // Xử lý các ICE candidates đang chờ
                    if (pendingIceCandidatesRef.current.length > 0) {
                        console.log(`🧊 Xử lý ${pendingIceCandidatesRef.current.length} ICE candidates đang chờ`);
                        for (const candidate of pendingIceCandidatesRef.current) {
                            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                        pendingIceCandidatesRef.current = [];
                    }
                } catch (err) {
                    console.error("❌ Lỗi khi set remote description:", err);
                }
            }
        });

        // ✅ VIDEO: Nhận ICE candidate
        socket.on("video-ice-candidate", async ({ from, candidate }) => {
            console.log("🧊 Nhận VIDEO ICE candidate từ", from);
            
            try {
                if (candidate && pcRef.current) {
                    // Kiểm tra xem đã có remote description chưa
                    if (pcRef.current.remoteDescription) {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                        console.log("✅ Đã thêm VIDEO ICE candidate");
                    } else {
                        // Lưu lại để xử lý sau khi có remote description
                        console.log("⏳ Lưu ICE candidate để xử lý sau");
                        pendingIceCandidatesRef.current.push(candidate);
                    }
                }
            } catch (err) {
                console.error("❌ Lỗi khi thêm VIDEO ICE candidate:", err);
            }
        });

        // ✅ VIDEO: Cuộc gọi kết thúc
        socket.on("video-call-ended", ({ from }) => {
            console.log("📴 Cuộc gọi video bị ngắt bởi User", from);
            isEndingCallRef.current = true;
            
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
                callTimerRef.current = null;
            }
            
            cleanupLocalOnly();
            setShowEndCallScreen(true);
            setCallStatus("Cuộc gọi đã kết thúc");
            
            setTimeout(() => {
                setShowCallModal(false);
                setShowEndCallScreen(false);
                setIncomingCall(null);
                setCurrentReceiverId(null);
                setCallDuration(0);
                isEndingCallRef.current = false;
            }, 3000);
        });

        return () => {
            socket.off("incoming-video-call");
            socket.off("video-call-answered");
            socket.off("video-ice-candidate");
            socket.off("video-call-ended");
        };
    }, [user]);

    const createPeer = (targetId) => {
        console.log("🔧 Tạo peer connection mới cho", targetId);
        
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" }
            ]
        });

        peer.ontrack = (event) => {
            console.log("🎥 Nhận track:", event.track.kind, "từ User", targetId);
            console.log("📹 Track enabled:", event.track.enabled, "readyState:", event.track.readyState);
            
            // Chỉ set srcObject 1 lần khi nhận được stream
            if (remoteVideoRef.current && event.streams[0]) {
                // Kiểm tra xem đã set stream chưa
                if (!remoteVideoRef.current.srcObject) {
                    console.log("🔄 Setting remote stream...");
                    remoteVideoRef.current.srcObject = event.streams[0];
                    console.log("✅ Đã gán remote stream vào video element");
                    console.log("📹 Stream active:", event.streams[0].active);
                    console.log("📹 Stream tracks:", event.streams[0].getTracks().map(t => `${t.kind}: ${t.enabled} (${t.readyState})`));
                    
                    // Đảm bảo video được play
                    setTimeout(() => {
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.play()
                                .then(() => console.log("▶️ Remote video playing"))
                                .catch(err => console.error("❌ Lỗi play video:", err));
                        }
                    }, 100);
                    
                    setCallStatus("Đang trong cuộc gọi video");
                    setIsInCall(true);
                    
                    // Bắt đầu đếm thời gian
                    if (!callTimerRef.current) {
                        callStartTimeRef.current = Date.now();
                        callTimerRef.current = setInterval(() => {
                            const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
                            setCallDuration(elapsed);
                        }, 1000);
                    }
                } else {
                    console.log("⚠️ Remote video already has srcObject, skipping");
                }
            } else {
                console.error("❌ Missing remoteVideoRef or stream");
            }
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("📤 Gửi VIDEO ICE candidate tới", targetId);
                socket.emit("video-ice-candidate", {
                    senderId: String(user.id),
                    receiverId: String(targetId),
                    candidate: event.candidate,
                });
            }
        };

        peer.oniceconnectionstatechange = () => {
            console.log("🔗 VIDEO ICE State:", peer.iceConnectionState);
            if (peer.iceConnectionState === "connected") {
                setCallStatus("Kết nối video thành công ✅");
            } else if (peer.iceConnectionState === "disconnected") {
                setCallStatus("Mất kết nối video...");
            } else if (peer.iceConnectionState === "failed") {
                setCallStatus("Kết nối video thất bại");
                hangUpCall();
            }
        };

        peer.onsignalingstatechange = () => {
            console.log("📡 Signaling State:", peer.signalingState);
        };

        return peer;
    };

    const startCall = async (receiverId) => {
        try {
            console.log("📞 Bắt đầu gọi video tới", receiverId);
            isEndingCallRef.current = false;
            pendingIceCandidatesRef.current = [];
            setCurrentReceiverId(receiverId);
            setShowCallModal(true);
            setCallStatus("Đang gọi video...");
            setIsInCall(false);
            
            fetchReceiver(receiverId);
            
            // Tạo peer connection
            const peer = createPeer(receiverId);
            pcRef.current = peer;

            // Lấy media stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            console.log("✅ Đã lấy được media stream");
            
            // Thêm tracks vào peer
            stream.getTracks().forEach((track) => {
                peer.addTrack(track, stream);
                console.log("➕ Đã thêm track:", track.kind);
            });
            
            // Hiển thị local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            // Tạo offer
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            console.log("✅ Đã tạo offer");

            // Gửi offer
            socket.emit("call-video-user", { 
                senderId: String(user.id), 
                receiverId: String(receiverId), 
                offer 
            });
            console.log("📤 Đã gửi offer");
        } catch (err) {
            console.error("❌ Lỗi khi gọi video:", err);
            setCallStatus("Lỗi: " + err.message);
            if (err.name === 'NotAllowedError') {
                alert("Cần quyền camera và mic! Kiểm tra browser settings.");
            } else if (err.name === 'NotFoundError') {
                alert("Không tìm thấy camera/mic!");
            } else {
                alert("Không thể truy cập camera/mic: " + err.message);
            }
            cleanupLocalOnly();
            setShowCallModal(false);
            setCurrentReceiverId(null);
        }
    };

    const acceptCall = async () => {
        if (!incomingCall) return;

        try {
            console.log("✅ Chấp nhận cuộc gọi video");
            isEndingCallRef.current = false;
            setCallStatus("Đang chấp nhận video...");
            
            const { from, offer } = incomingCall;
            
            // Clear incoming call TRƯỚC để UI hiển thị video screens
            setIncomingCall(null);
            
            // Đợi một chút để UI render video elements
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Kiểm tra video refs đã ready chưa
            let retries = 0;
            while (!remoteVideoRef.current && retries < 10) {
                console.log("⏳ Đang đợi video elements mount...");
                await new Promise(resolve => setTimeout(resolve, 50));
                retries++;
            }
            
            if (!remoteVideoRef.current) {
                throw new Error("Video elements không mount được!");
            }
            
            console.log("✅ Video elements đã ready");
            
            // Tạo peer connection
            const peer = createPeer(from);
            pcRef.current = peer;

            // Lấy media stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 }, 
                    facingMode: 'user' 
                } 
            });
            
            console.log("✅ Đã lấy được media stream");
            
            // Thêm tracks vào peer
            stream.getTracks().forEach((track) => {
                peer.addTrack(track, stream);
                console.log("➕ Đã thêm track:", track.kind);
            });
            
            // Hiển thị local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Set remote description (offer từ người gọi)
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("✅ Đã set remote description (offer)");
            
            // Xử lý các ICE candidates đang chờ
            if (pendingIceCandidatesRef.current.length > 0) {
                console.log(`🧊 Xử lý ${pendingIceCandidatesRef.current.length} ICE candidates đang chờ`);
                for (const candidate of pendingIceCandidatesRef.current) {
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingIceCandidatesRef.current = [];
            }
            
            // Tạo answer
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            console.log("✅ Đã tạo answer");

            // Gửi answer
            socket.emit("answer-video-call", { 
                senderId: String(from), 
                receiverId: String(user.id), 
                answer 
            });
            console.log("📤 Đã gửi answer");

            setCallStatus("Đang kết nối...");
        } catch (err) {
            console.error("❌ Lỗi khi chấp nhận cuộc gọi:", err);
            setCallStatus("Lỗi: " + err.message);
            if (err.name === 'NotAllowedError') {
                alert("Cần quyền camera và mic!");
            } else if (err.name === 'NotFoundError') {
                alert("Không tìm thấy camera/mic!");
            } else {
                alert("Lỗi: " + err.message);
            }
            cleanupLocalOnly();
        }
    };

    const rejectCall = () => {
        if (!incomingCall) return;
        
        console.log("❌ Từ chối cuộc gọi");
        isEndingCallRef.current = true;
        
        socket.emit("end-video-call", {
            senderId: String(user.id),
            receiverId: String(incomingCall.from)
        });
        
        setIncomingCall(null);
        setShowCallModal(false);
        setCallStatus("");
        setCallDuration(0);
        setCurrentReceiverId(null);
        pendingIceCandidatesRef.current = [];
        
        setTimeout(() => {
            isEndingCallRef.current = false;
        }, 500);
    };

    const hangUpCall = () => {
        console.log("📴 Ngắt cuộc gọi VIDEO");
        
        if (isEndingCallRef.current) {
            console.log("⚠️ Đã đang trong quá trình kết thúc cuộc gọi");
            cleanupLocalOnly();
            return;
        }

        isEndingCallRef.current = true;
        
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
        
        const targetReceiverId = currentReceiverId || incomingCall?.from;
        
        if (targetReceiverId) {
            socket.emit("end-video-call", {
                senderId: String(user.id),
                receiverId: String(targetReceiverId)
            });
            console.log("📤 Đã gửi tín hiệu end-video-call");
        }
        
        cleanupLocalOnly();
        setShowEndCallScreen(true);
        setCallStatus("Cuộc gọi video đã kết thúc");
        setIncomingCall(null);
        
        setTimeout(() => {
            setShowCallModal(false);
            setShowEndCallScreen(false);
            setCallDuration(0);
            setCurrentReceiverId(null);
            pendingIceCandidatesRef.current = [];
            isEndingCallRef.current = false;
        }, 3000);
    };

    const cleanupLocalOnly = () => {
        
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => {
                track.stop();
                console.log("🛑 Stopped track:", track.kind);
            });
            localVideoRef.current.srcObject = null;
            localVideoRef.current.load(); // Reset video element
        }
        
        if (remoteVideoRef.current?.srcObject) {
            remoteVideoRef.current.srcObject = null;
            remoteVideoRef.current.load(); // Reset video element
        }
        
        setIsInCall(false);
        setIsMuted(false);
        setIsVideoOff(false);
        setCurrentFacingMode('user');
        pendingIceCandidatesRef.current = [];
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle Mute/Unmute
    const toggleMute = () => {
        if (localVideoRef.current?.srcObject) {
            const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                console.log(audioTrack.enabled ? "🔊 Unmuted" : "🔇 Muted");
            }
        }
    };

    // Toggle Video On/Off
    const toggleVideo = () => {
        if (localVideoRef.current?.srcObject) {
            const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
                console.log(videoTrack.enabled ? "📹 Video On" : "📹 Video Off");
            }
        }
    };

    // Switch Camera (Front/Back)
    const switchCamera = async () => {
        try {
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            
            // Stop current video track
            if (localVideoRef.current?.srcObject) {
                const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.stop();
                }
            }

            // Get new stream with different camera
            const newStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode: newFacingMode }
            });

            // Replace video track in peer connection
            if (pcRef.current) {
                const videoTrack = newStream.getVideoTracks()[0];
                const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
            }

            // Update local video
            if (localVideoRef.current) {
                const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
                const newVideoTrack = newStream.getVideoTracks()[0];
                localVideoRef.current.srcObject = new MediaStream([audioTrack, newVideoTrack]);
            }

            setCurrentFacingMode(newFacingMode);
            console.log(`📷 Switched to ${newFacingMode} camera`);
        } catch (err) {
            console.error("❌ Lỗi khi switch camera:", err);
            alert("Không thể chuyển camera. Có thể thiết bị chỉ có 1 camera.");
        }
    };

    useImperativeHandle(ref, () => ({
        startCall,
        hangUpCall,
    }));

    return (
        <>
            {showCallModal && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">
                                🎥 Cuộc gọi video
                            </h3>
                            <button onClick={hangUpCall} className="text-gray-400 hover:text-white">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Incoming Call Screen */}
                        {incomingCall && !isInCall && !showEndCallScreen && (
                            <div className="text-center mb-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center animate-pulse">
                                    <FiVideo size={40} className="text-green-600" />
                                </div>
                                <p className="text-gray-300 mb-2">Cuộc gọi video đến từ</p>
                                <p className="font-bold text-lg text-white mb-4">
                                    {receiverInfo?.name || `User ${incomingCall.from}`}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={acceptCall}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
                                    >
                                        <FiVideo /> Chấp nhận
                                    </button>
                                    <button
                                        onClick={rejectCall}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
                                    >
                                        <FiPhoneOff /> Từ chối
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Video Screens */}
                        {!incomingCall && !showEndCallScreen && (
                            <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
                                {/* Remote Video (Full Screen) */}
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay
                                    playsInline
                                    controls={false}
                                    className="w-full h-full object-cover bg-gray-900"
                                    style={{ minHeight: '500px' }}
                                    onCanPlay={(e) => {
                                        console.log("📹 Remote video can play");
                                        e.target.play().catch(err => console.error("Play error:", err));
                                    }}
                                    onPlaying={() => console.log("▶️ Remote video is playing")}
                                    onError={(e) => console.error("❌ Remote video error:", e)}
                                />
                                
                                {/* Local Video (Picture-in-Picture) */}
                                <div className="absolute bottom-4 right-4">
                                    <video 
                                        ref={localVideoRef} 
                                        autoPlay 
                                        muted 
                                        playsInline
                                        className="w-40 h-32 object-cover rounded-lg border-2 border-white shadow-lg bg-gray-700"
                                        onError={(e) => console.error("❌ Local video error:", e)}
                                    />
                                    {isVideoOff && (
                                        <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
                                            <FiVideoOff size={32} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Overlay Info */}
                                <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded">
                                    <p className="font-bold text-white">
                                        {receiverInfo?.name || `User ${currentReceiverId}`}
                                    </p>
                                    <p className="text-sm text-gray-300">{callStatus}</p>
                                </div>
                                
                                {/* Call Duration */}
                                {isInCall && (
                                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-2 rounded">
                                        <p className="text-xl font-mono text-white">
                                            {formatDuration(callDuration)}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Loading indicator khi chưa có video */}
                                {!isInCall && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                                            <p className="text-white">Đang kết nối video...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* End Call Screen */}
                        {showEndCallScreen && (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <FiPhoneOff size={40} className="text-red-600" />
                                </div>
                                <p className="font-bold text-lg text-white mb-1">
                                    Cuộc gọi đã kết thúc
                                </p>
                                <p className="text-sm text-gray-300">
                                    Thời gian: <span className="font-mono font-bold text-blue-400">{formatDuration(callDuration)}</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Đang đóng...</p>
                            </div>
                        )}

                        {/* Hang Up Button */}
                        {(isInCall || (!incomingCall && pcRef.current)) && !showEndCallScreen && (
                            <div className="mt-4 space-y-3">
                                {/* Control Buttons */}
                                <div className="flex gap-3 justify-center">
                                    {/* Mute/Unmute Button */}
                                    <button
                                        onClick={toggleMute}
                                        className={`${
                                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                                        } text-white px-4 py-3 rounded-lg flex items-center gap-2 transition`}
                                        title={isMuted ? "Bật mic" : "Tắt mic"}
                                    >
                                        {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
                                    </button>

                                    {/* Video On/Off Button */}
                                    <button
                                        onClick={toggleVideo}
                                        className={`${
                                            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                                        } text-white px-4 py-3 rounded-lg flex items-center gap-2 transition`}
                                        title={isVideoOff ? "Bật camera" : "Tắt camera"}
                                    >
                                        {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                                    </button>

                                    {/* Switch Camera Button */}
                                    <button
                                        onClick={switchCamera}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition"
                                        title="Đổi camera"
                                    >
                                        <FiRotateCw size={20} />
                                    </button>
                                </div>

                                {/* Hang Up Button */}
                                <button
                                    onClick={hangUpCall}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition"
                                >
                                    <FiPhoneOff size={20} /> Ngắt kết nối
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
});

export default VideoCall;