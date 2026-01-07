import { useRef, useState } from "react";
import { FiCamera, FiImage } from "react-icons/fi";
import { BsEmojiSmile } from "react-icons/bs";
import { Send, ThumbsUp, Mic, MicOff } from "lucide-react";
import axios from "axios";
import api from "../../api/api";
import socket from "../../utils/socket";

export default function MessageInput({ userId, receiverId, onMessageSent, setChat, setHasUnread }) {
    const [inputValue, setInputValue] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [isListening, setIsListening] = useState(false); // Trạng thái ghi âm
    
    // Thêm ref riêng cho từng box
    const fileInputRef = useRef(null);
    
    const recognitionRef = useRef(null); // Lưu instance của speech recognition
    // Khởi tạo Speech Recognition
    const initSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!");
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt
        recognition.continuous = true; // Tiếp tục nghe
        recognition.interimResults = true; // Hiển thị kết quả tạm thời

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInputValue(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Lỗi nhận diện giọng nói:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return recognition;
    };

    // Bắt đầu/dừng ghi âm
    const toggleVoiceInput = () => {
        if (!recognitionRef.current) {
            recognitionRef.current = initSpeechRecognition();
        }

        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Mở chọn file bằng cách click nút
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };
        
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (isImage) {
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
            setPreviewVideo(null);
            setUploadFile(file);
        } 
        else if (isVideo) {
            const previewUrl = URL.createObjectURL(file);
            setPreviewVideo(previewUrl);
            setPreviewImage(null);
            setUploadFile(file);
            setProgress(0);
        } 
        else {
            alert("Vui lòng chọn ảnh hoặc video hợp lệ!");
        }

        // Reset input để có thể chọn lại cùng file
        e.target.value = null;
    };

    const cancelUpload = () => {
        setPreviewImage(null);
        setPreviewVideo(null);
        setUploadFile(null);
        setProgress(0);
    };

    const sendTextMessage = () => {
        const content = inputValue.trim();
        if (!content) return;

        socket.emit("private_message", {
            sender_id: userId,
            receiver_id: receiverId,
            content,
        });

        setInputValue("");
        onMessageSent?.();
    };

    const uploadImage = async () => {
        const formData = new FormData();
        formData.append("image", uploadFile);
        formData.append("receiverId", receiverId);

        setIsUploading(true);
        try {
            const res = await axios.post(api + "image/upload-message-image", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setProgress(percent);
                },
            });

            if (res.data.success) {
                socket.emit("send_image_message", {
                    id: res.data.message.id,
                    senderId: userId,
                    receiverId,
                    fileUrl: res.data.message.imageUrl,
                });
                cancelUpload();
                onMessageSent?.();
            }
        } catch (err) {
            alert("Upload ảnh thất bại!");
        } finally {
            setIsUploading(false);
        }
    };

    const uploadVideo = async () => {
        const formData = new FormData();
        formData.append("video", uploadFile);
        formData.append("receiverId", receiverId);

        setIsUploading(true);
        try {
            const res = await axios.post(api + "image/upload-video", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    setProgress(percent);
                },
            });

            if (res.data.success) {
                socket.emit("send_video_message", {
                    senderId: userId,
                    receiverId,
                    fileUrl: res.data.video.url,
                    videoName: uploadFile.name,
                    videoSize: (uploadFile.size / (1024*1024)).toFixed(1),
                });
                cancelUpload();
                onMessageSent?.();
            }
        } catch (err) {
            alert("Upload video thất bại!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        sendTextMessage();

        if (uploadFile) {
            if (uploadFile.type.startsWith("image/")) uploadImage();
            else if (uploadFile.type.startsWith("video/")) uploadVideo();
        }
    };

    const hasContent = inputValue.trim() || uploadFile;

        const handleFocusInput = () => {
        if (!userId || !receiverId) return;
        
        socket.emit("mark_as_read", {
            userId: parseInt(userId),
            senderId: parseInt(receiverId),
        });

        setChat((prevChat) =>
            prevChat.map((msg) =>
                Number(msg.sender_id) === Number(receiverId) && Number(msg.receiver_id) === Number(userId)
                    ? { ...msg, is_read: true }
                    : msg
            )
        );
        
        setHasUnread(false);
    };

    return (
        <>
            {previewImage && (
                <div className="flex justify-end mb-2">
                    <div className="rounded-2xl max-w-xs">
                        <img
                            src={previewImage}
                            alt="preview"
                            className="max-w-[50px] max-h-[50px] rounded-lg object-cover"
                        />
                        {isUploading && (
                            <>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-sm mt-1 text-gray-600">Đang tải lên... {progress}%</p>
                            </>
                        )}
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImage(null);
                                    setUploadFile(null);
                                }}
                                className="text-red-500 text-xs"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {previewVideo && (
                <div className="flex justify-end mt-4">
                    <div className="rounded-2xl max-w-xs">
                        <video
                            src={previewVideo}
                            className="max-w-[200px] max-h-[200px] rounded-lg bg-black"
                            controls
                        />
                        {isUploading && (
                            <>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-sm mt-1 text-gray-600">Đang tải lên... {progress}%</p>
                            </>
                        )}
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewVideo(null);
                                    setUploadFile(null);
                                    setProgress(0);
                                }}
                                className="text-red-500 text-xs"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="p-2 border-t bg-white rounded-b-lg">
                <div className="flex items-center">
                    {/* <button
                        type="button"
                        className="text-blue-500 p-2 hover:text-gray-700"
                    >
                        <FiCamera size={18} />
                    </button> */}
                    <button 
                        type="button" 
                        onClick={openFilePicker} 
                        className="text-blue-500 p-2 hover:text-gray-700 rounded-full"
                    >
                        <FiImage size={18} />
                    </button>

                    <input
                        ref={fileInputRef}                  // Dùng ref thay vì id
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        className="text-blue-500 p-2 hover:text-gray-700"
                    >
                        <BsEmojiSmile size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-2 rounded-full transition ${
                            isListening 
                                ? 'text-red-500 bg-red-100 animate-pulse' 
                                : 'text-blue-500 hover:text-gray-700'
                        }`}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3">
                        <input
                            type="text"
                            placeholder="Aa"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={handleFocusInput}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent py-2 text-sm focus:outline-none"
                        />
                    </div>
                    {hasContent ? (
                        <button type="submit" className="text-blue-500 hover:bg-gray-100 p-2 rounded-full transition ml-2">
                            <Send size={18} />
                        </button>
                    ) : (
                        <button type="button" className="text-blue-500 hover:bg-gray-100 p-2 rounded-full transition ml-2">
                            <ThumbsUp size={18} />
                        </button>
                    )}
                </div>
            </form>
        </>
    );
}