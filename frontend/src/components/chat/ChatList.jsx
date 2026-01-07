import { MoreVertical, Trash2, Phone, Download, Lock, FileText } from "lucide-react";
import { useRef, useState } from "react";
import src from "../../api/src";
import ImageModal from "../ui/Image";
import VideoMessageUI from "../ui/VideoMessageUI";
import { decryptFile } from "../../utils/encryption"
import axios from "axios";

function ChatList({ chat, user, messagesEndRef }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [decryptingFile, setDecryptingFile] = useState(null); // State cho file đang giải mã
    const chatContainerRef = useRef(null);

    const allImages = chat
        .filter((msg) => msg.image_url)
        .map((msg) => src + msg.image_url);

    const getMessageTimestamp = (msg) => msg.call?.started_at || msg.created_at;

    const getDateDisplay = (msg) => {
        const date = new Date(getMessageTimestamp(msg));
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const getTime = (msg) => new Date(getMessageTimestamp(msg)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const timeDiffMin = (prevMsg, msg) => (new Date(getMessageTimestamp(msg)) - new Date(getMessageTimestamp(prevMsg))) / (1000 * 60);

    const isToday = (msg) => {
        const msgDate = new Date(getMessageTimestamp(msg));
        const today = new Date();
        return msgDate.toDateString() === today.toDateString();
    };

    // Handler download và giải mã file
    const handleDownloadEncryptedFile = async (fileUrl, iv, fileName, fileType) => {
        try {
            setDecryptingFile(fileName);

            // Fetch file đã mã hóa từ server
            const response = await axios.get(`http://localhost:3000${fileUrl}`, {
                responseType: 'arraybuffer'
            });

            // Convert ArrayBuffer to Base64
            const base64 = btoa(
                new Uint8Array(response.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ''
                )
            );

            // Giải mã file
            const decryptedBlob = decryptFile(base64, iv, fileType);

            // Download file đã giải mã
            const url = URL.createObjectURL(decryptedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download encrypted file error:', error);
            alert('Không thể tải xuống file. Vui lòng thử lại!');
        } finally {
            setDecryptingFile(null);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="relative" ref={chatContainerRef} style={{ overflowY: 'auto', maxHeight: '100%' }}>
            {chat.map((msg, i) => {
                const isCurrentUser = msg.sender_id === user?.id;
                const prevMsg = i > 0 ? chat[i - 1] : null;
                const nextMsg = i < chat.length - 1 ? chat[i + 1] : null;
                const showAvatar = !isCurrentUser && (!nextMsg || nextMsg.sender_id !== msg.sender_id);
                const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                const showTime = !prevMsg || timeDiffMin(prevMsg, msg) > 10;

                return (
                    <div key={msg.id || i}>
                        {showTime && (
                            <div className="w-full flex justify-center mt-0.5 sm:mt-1">
                                <span className="text-[10px] sm:text-xs text-gray-500">
                                    {getTime(msg)} {!isToday(msg) && ` ${getDateDisplay(msg)}`}
                                </span>
                            </div>
                        )}
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`flex mb-0.5 sm:mb-1 ${
                                    isCurrentUser ? 'justify-end' : 'justify-start'
                                } ${isFirstInGroup ? 'mt-1 sm:mt-2' : ''}`}
                            >
                                {!isCurrentUser && (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 mr-1.5 sm:mr-2 mt-auto flex-shrink-0">
                                        {showAvatar && (
                                            <img
                                                src={msg.sender?.image_url == null ? "https://cdn-icons-png.flaticon.com/512/4825/4825038.png" : src + msg.sender?.image_url}
                                                alt=""
                                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0"
                                            />
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`relative group flex items-end gap-1 sm:gap-2 ${
                                        isCurrentUser ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {/* Nội dung tin nhắn */}
                                    <div
                                        className={`max-w-[75vw] sm:max-w-xs text-xs sm:text-sm ${
                                            isCurrentUser
                                                ? (msg.call || msg.image_url || msg.video_url || msg.file_url
                                                    ? 'bg-blue-500 text-white rounded-2xl'
                                                    : 'bg-blue-500 text-white rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2')
                                                : (msg.call || msg.image_url || msg.video_url || msg.file_url
                                                ? 'bg-gray-200 text-black rounded-2xl'
                                                : 'bg-gray-200 text-black rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2')
                                        }`}
                                    >
                                        {/*ENCRYPTED FILE MESSAGE */}
                                        {msg.file_url && msg.is_encrypted ? (
                                            <div className="p-2 sm:p-3">
                                                <div className={`${
                                                    isCurrentUser 
                                                        ? 'bg-blue-600/50' 
                                                        : 'bg-gray-300'
                                                } rounded-lg p-2 sm:p-3 min-w-[180px] sm:min-w-[220px]`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`${
                                                            isCurrentUser 
                                                                ? 'bg-white/20' 
                                                                : 'bg-white'
                                                        } p-1.5 sm:p-2 rounded-lg`}>
                                                            <FileText size={18} className={isCurrentUser ? 'text-white' : 'text-gray-700'} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[10px] sm:text-xs font-medium truncate ${
                                                                isCurrentUser ? 'text-white' : 'text-gray-800'
                                                            }`}>
                                                                {msg.file_name}
                                                            </p>
                                                            <p className={`text-[9px] sm:text-[10px] ${
                                                                isCurrentUser ? 'text-blue-200' : 'text-gray-600'
                                                            }`}>
                                                                {formatFileSize(msg.file_size)}
                                                            </p>
                                                        </div>
                                                        <Lock size={14} className={isCurrentUser ? 'text-yellow-300' : 'text-green-600'} />
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => handleDownloadEncryptedFile(
                                                            msg.file_url,
                                                            msg.file_iv,
                                                            msg.file_name,
                                                            msg.file_type
                                                        )}
                                                        disabled={decryptingFile === msg.file_name}
                                                        className={`flex items-center justify-center gap-1.5 ${
                                                            isCurrentUser
                                                                ? 'bg-white/20 hover:bg-white/30'
                                                                : 'bg-white hover:bg-gray-50'
                                                        } px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[10px] sm:text-xs`}
                                                    >
                                                        <Download size={12} className={isCurrentUser ? 'text-white' : 'text-gray-700'} />
                                                        <span className={`font-medium ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                                                            {decryptingFile === msg.file_name ? 'Đang giải mã...' : 'Tải xuống'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : msg.video_url ? (
                                            <VideoMessageUI msg={msg} />
                                        ) : msg.image_url ? (
                                            <img
                                                src={src + msg.image_url}
                                                alt="message"
                                                onClick={() => setSelectedImage(src + msg.image_url)}
                                                onLoad={() => { messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); }}
                                                className="
                                                    max-w-[120px] sm:max-w-[150px]
                                                    max-h-[120px] sm:max-h-[150px]
                                                    w-auto h-auto
                                                    rounded-lg cursor-pointer object-cover
                                                "
                                            />
                                        ) : msg.call ? (
                                            <div
                                                className={`max-w-[75vw] sm:max-w-xs border border-gray-300 rounded-xl p-3 flex flex-col gap-2 ${
                                                    msg.sender_id === user?.id ? 'bg-blue-50' : 'bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-5 w-5 text-gray-700" />
                                                    <span className="font-medium text-gray-800">
                                                        {msg.call.status === 'missed' ? 'Đã bỏ lỡ cuộc gọi' : 'Cuộc gọi'}
                                                    </span>
                                                </div>
                                                {msg.call.status === 'missed' && (
                                                    <button
                                                        onClick={() => console.log('Gọi lại', msg.call.receiver_id)}
                                                        className="bg-blue-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-blue-600"
                                                    >
                                                        Gọi lại
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Hiển thị "Đã xem" */}
                            {isCurrentUser &&
                                msg.is_read &&
                                i ===
                                    chat
                                        .map((m, index) =>
                                            m.sender_id === user.id && m.is_read ? index : -1
                                        )
                                        .filter((x) => x !== -1)
                                        .pop() && (
                                    <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1">
                                        <img
                                            src={msg.sender?.image_url == null ? "https://cdn-icons-png.flaticon.com/512/4825/4825038.png" : src + msg.sender?.image_url}
                                            alt="Đã xem"
                                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full inline-block"
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />

            {/* Modal xem ảnh */}
            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage}
                images={allImages}
            />
        </div>
    );
}

export default ChatList;