import axios from 'axios';
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import api from '../api/api';
import { formatLastActive } from "../utils/format";
import src from '../api/src';
import { MessageCircle, Image, MoreHorizontal, Heart, Share2, Video, Smile, ThumbsUp } from 'lucide-react';
import CreatePostModal from '../components/home/CreatePostModal';
import PreviewModal from '../components/home/PreviewModal';
import CommentPostModal from '../components/home/CommentPostModal';

function HomePage({ profile }) {
    // Modal States
    const [modalCreatePostOpen, setModalCreatePostOpen] = useState(false);
    const [modalPreviewOpen, setModalPreviewOpen] = useState(false);

    const [modalPost, setModalPost] = useState(false)
    const [idPost, setIdPost] = useState(null)

    // Preview States
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [previewMediaList, setPreviewMediaList] = useState([]);

    const [postContent, setPostContent] = useState("");
    const [mediaFiles, setMediaFiles] = useState([]);
    const [previewMedia, setPreviewMedia] = useState([]);


    const [posts, setPosts] = useState([]);
    const [showReactions, setShowReactions] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState({});

    const reactions = [
        { name: "like", icon: "👍", color: "#1877F2" },
        { name: "love", icon: "❤️", color: "#F33E58" },
        { name: "haha", icon: "😆", color: "#F7B125" },
        { name: "wow", icon: "😮", color: "#F7B125" },
        { name: "sad", icon: "😢", color: "#F7B125" },
        { name: "angry", icon: "😡", color: "#E9710F" },
    ];

    // Tải bài viết
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get(api + "posts", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (res.data.status) setPosts(res.data.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
        fetchPosts();
    }, []);

    // Chọn ảnh/video
    const handleSelectMedia = (e) => {
        const files = [...e.target.files];
        setMediaFiles(files);
        setPreviewMedia(files.map(file => URL.createObjectURL(file)));
    };

    // Tạo bài viết mới
    const handleCreatePost = async () => {
        const formData = new FormData();
        formData.append("user_id", profile.id);
        formData.append("content", postContent);
        formData.append("privacy", "public");
        mediaFiles.forEach(file => formData.append("media", file));
        const res = await axios.post(api + "posts", formData, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`, 
                "Content-Type": "multipart/form-data" 
            },
        });
        if (res.data.status) toast.success(res.data.message);
        setPosts([res.data.data, ...posts]);
        setPostContent("");
        setMediaFiles([]);
        setPreviewMedia([]);
        setModalCreatePostOpen(false);
    };

    // Mở modal xem ảnh
    const handleOpenPreview = (mediaList, index) => {
        setPreviewMediaList(mediaList);
        setCurrentPreviewIndex(index);
        setModalPreviewOpen(true);
    };

    const handlePrev = () => 
        setCurrentPreviewIndex((prev) => 
            prev === 0 ? previewMediaList.length - 1 : prev - 1
        );

    const handleNext = () => 
        setCurrentPreviewIndex((prev) => 
            prev === previewMediaList.length - 1 ? 0 : prev + 1
        );

    // Thêm cảm xúc
    const handleReaction = async (post_id, reaction_type) => {
        try {
            const res = await axios.post(
                api + "reaction",
                { post_id, reaction_type },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                // Tạo object reaction mới với đầy đủ thông tin
                const newReaction = {
                    user_id: profile.id,
                    reaction_type: reaction_type,
                };

                // Cập nhật state ngay lập tức
                setPosts(prev =>
                    prev.map(p =>
                        p.id === post_id
                            ? {
                                ...p,
                                // Thêm reaction mới vào cuối mảng
                                reactions: [...(p.reactions || []), newReaction],
                                user_reacted: reaction_type
                            }
                            : p
                    )
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Xóa reaction - cập nhật length 
    const handleDeleteReaction = async (post_id) => {
        try {
            const res = await axios.delete(
                api + "reaction/delete",
                {
                    data: { post_id },
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                
                // Cập nhật state: xóa reaction của user hiện tại
                setPosts(prev =>
                    prev.map(p =>
                        p.id === post_id
                            ? {
                                ...p,
                                reactions: p.reactions.filter(r => r.user_id !== profile.id),
                                user_reacted: null
                            }
                            : p
                    )
                );

                // Xóa selectedReaction
                setSelectedReaction(prev => {
                    const newState = { ...prev };
                    delete newState[post_id];
                    return newState;
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Helper function để đếm và hiển thị reactions
    const getReactionSummary = (reactions) => {
        if (!reactions || reactions.length === 0) return null;

        const counts = {};
        reactions.forEach(r => {
            counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const iconMap = {  like: "👍",  love: "❤️",  haha: "😆",  wow: "😮",  sad: "😢",  angry: "😡"  };

        return (
            <>
                {sorted.map(([type]) => (
                    <span key={type} className="text-sm -ml-1">{iconMap[type]}</span>
                ))}
                <span className="ml-1 text-gray-600 text-sm">
                    {reactions.length} lượt thích
                </span>
            </>
        );
    };


    const handleModalPost = (post_id) => {
        setModalPost(true)
        setIdPost(post_id)
        console.log(post_id)
    }
    return (
        <div>
            <div className="bg-white shadow-sm border border-gray-200 p-4 mb-4 flex gap-3 items-center">
                <img
                    src={src + profile?.image_url || "pl.png"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-white cursor-pointer object-cover"
                />
                <input
                    type="text"
                    placeholder={`${profile?.name}, bạn đang nghĩ gì?`}
                    onClick={() => setModalCreatePostOpen(true)}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm placeholder:text-gray-500 focus:outline-none hover:bg-gray-200 cursor-pointer"
                />
                <Video size={20} className="text-red-500 cursor-pointer" />
                <Image size={20} className="text-green-500 cursor-pointer" />
                <Smile size={20} className="text-yellow-500 cursor-pointer" />
            </div>

            <CreatePostModal
                isOpen={modalCreatePostOpen}
                onClose={() => setModalCreatePostOpen(false)}
                profile={profile}
                postContent={postContent}
                setPostContent={setPostContent}
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                previewMedia={previewMedia}
                setPreviewMedia={setPreviewMedia}
                handleSelectMedia={handleSelectMedia}
                handleCreatePost={handleCreatePost}
                src={src}
            />

            <PreviewModal
                isOpen={modalPreviewOpen}
                onClose={() => setModalPreviewOpen(false)}
                previewMediaList={previewMediaList}
                currentPreviewIndex={currentPreviewIndex}
                setCurrentPreviewIndex={setCurrentPreviewIndex}
                handlePrev={handlePrev}
                handleNext={handleNext}
                src={src}
            />

            {/* Danh sách bài viết */}
            {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-md shadow-sm border border-gray-200 mb-4">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={src + post.user?.image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
                                alt={post.user?.name}
                                className="w-11 h-11 rounded-full border-white cursor-pointer object-cover"
                            />
                            <div>
                                <h4 className="font-semibold text-gray-900">{post.user?.name}</h4>
                                <p className="text-xs text-gray-500">{formatLastActive(post.created_at)}</p>
                            </div>
                        </div>
                        <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-gray-600 transition" size={20} />
                    </div>

                    <div className="px-4 pb-3">
                        <p className="text-gray-800 text-sm">{post.content}</p>
                    </div>

                    {/* Media */}
                    {post.media && post.media.length > 0 && (
                        <div
                            className="grid gap-1"
                            style={{
                                gridTemplateColumns: `repeat(${Math.min(post.media.length, 2)}, 1fr)`,
                                gridAutoRows: "auto"
                            }}
                        >
                            {post.media.slice(0, 4).map((media, index) => (
                                <div key={index} className="relative cursor-pointer">
                                    <img
                                        src={src + media.media_url}
                                        alt={`media-${index}`}
                                        className="w-full rounded-lg object-contain bg-gray-100"
                                        style={{ maxHeight: post.media.length === 1 ? "500px" : "250px" }}
                                        onClick={() => handleOpenPreview(post.media, index)}
                                    />
                                    {index === 3 && post.media.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold rounded-lg">
                                            +{post.media.length - 4}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer reactions - sử dụng helper function */}
                    <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            {getReactionSummary(post.reactions)}
                        </div>
                        <div className="flex gap-3">
                            <span>{post.count} bình luận</span>
                            <span>{post.shares} chia sẻ</span>
                        </div>
                    </div>

                    {/* Reaction buttons */}
                    <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-around">
                        <div className="relative inline-block">
                            <button
                                onClick={() => {
                                    if (post.user_reacted) {
                                        handleDeleteReaction(post.id);
                                    } else {
                                        handleReaction(post.id, reactions[0].name);
                                    }
                                }}
                                onMouseEnter={() => {
                                    if (!post.user_reacted) setShowReactions(post.id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                                style={{
                                    color: selectedReaction[post.id]?.color || (post.user_reacted ? reactions.find(r => r.name === post.user_reacted)?.color : '#4B5563')
                                }}
                            >
                                <span className="text-lg">
                                    {selectedReaction[post.id]?.icon
                                        || reactions.find(r => r.name === post.user_reacted)?.icon
                                        || <ThumbsUp size={18} fill="none" />}
                                </span>
                                {selectedReaction[post.id]?.name || post.user_reacted || 'Thích'}
                            </button>

                            {/* Reaction menu */}
                            {!post.user_reacted && showReactions === post.id && (
                                <div
                                    onMouseEnter={() => setShowReactions(post.id)}
                                    onMouseLeave={() => setShowReactions(null)}
                                    className="absolute -top-14 left-0 flex gap-2 bg-white shadow-lg px-3 py-2 rounded-full border animate-fade-in"
                                >
                                    {reactions.map(r => (
                                        <div
                                            key={r.name}
                                            onClick={() => {
                                                handleReaction(post.id, r.name);
                                                setShowReactions(null);
                                                setSelectedReaction(prev => ({ ...prev, [post.id]: r }));
                                            }}
                                            className="cursor-pointer text-2xl hover:scale-125 transition-transform"
                                        >
                                            {r.icon}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-600"
                            onClick={() => handleModalPost(post.id)}
                        >
                            <MessageCircle size={18} /> Bình luận
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-600">
                            <Share2 size={18} /> Chia sẻ
                        </button>
                    </div>
                </div>
            ))}
            {
                modalPost && 
                <CommentPostModal 
                    setModalPost={setModalPost} 
                    post={posts.find(p => p.id === idPost)}
                    handleReaction={handleReaction} 
                    handleDeleteReaction={handleDeleteReaction} 
                    selectedReaction={selectedReaction}
                    reactions={reactions}
                    setShowReactions={setShowReactions}
                    showReactions={showReactions}
                    setSelectedReaction={setSelectedReaction}
                    profile={profile}
                    getReactionSummary={getReactionSummary}
                />
            }
        </div>
    );
}

export default HomePage;