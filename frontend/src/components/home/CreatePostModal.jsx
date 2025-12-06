import { Image, Smile, X } from "lucide-react";

function CreatePostModal({ 
    isOpen, 
    onClose, 
    profile, 
    postContent, 
    setPostContent, 
    mediaFiles, 
    setMediaFiles, 
    previewMedia, 
    setPreviewMedia, 
    handleSelectMedia, 
    handleCreatePost,
    src 
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Tạo bài viết</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={src + profile?.image_url} 
                            alt="Avatar" 
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold">{profile?.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                <span>Công khai</span>
                            </div>
                        </div>
                    </div>

                    <input
                        className="w-full min-h-[120px] resize-none text-gray-800 text-sm focus:outline-none placeholder:text-gray-400 p-2 rounded-lg border border-gray-200"
                        placeholder={`${profile?.name}, bạn đang nghĩ gì?`}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        autoFocus
                    />

                    {previewMedia.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {previewMedia.slice(0, 4).map((previewSrc, i) => (
                                <div key={i} className="relative w-full h-32 rounded-lg overflow-hidden">
                                    {mediaFiles[i].type.startsWith("video") ? (
                                        <video src={previewSrc} controls className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <img src={previewSrc} className="w-full h-full object-cover rounded-lg " />
                                    )}

                                    {/* Xóa ảnh */}
                                    <button
                                        onClick={() => {
                                            const newMediaFiles = [...mediaFiles];
                                            const newPreviewMedia = [...previewMedia];
                                            newMediaFiles.splice(i, 1);
                                            newPreviewMedia.splice(i, 1);
                                            setMediaFiles(newMediaFiles);
                                            setPreviewMedia(newPreviewMedia);
                                        }}
                                        className="absolute top-1 right-1 w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
                                    >
                                        <X size={14} />
                                    </button>

                                    {/* +N overlay */}
                                    {i === 3 && previewMedia.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-bold">
                                            +{previewMedia.length - 4}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 transition">
                            <Image size={20} className="text-green-500" />
                            <span className="text-sm">Ảnh/Video</span>
                            <input 
                                type="file" 
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={handleSelectMedia}
                            />
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 transition">
                            <Smile size={20} className="text-yellow-500" />
                            <span className="text-sm">Cảm xúc/Hoạt động</span>
                        </label>
                    </div>
                </div>

                <div className="p-4 border-t">
                    <button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() && mediaFiles.length === 0}
                        className={`w-full py-2 rounded-full font-semibold text-white transition ${
                            postContent.trim() || mediaFiles.length > 0 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-gray-200 cursor-not-allowed text-gray-400'
                        }`}
                    >
                        Đăng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal