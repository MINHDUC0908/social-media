import axios from 'axios';
import { X, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Smile, Camera, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import { formatLastActive } from '../../utils/format';
import src from '../../api/src';
import Comment from './Comment';

function CommentPostModal({
    setModalPost,
    post: initialPost,
    handleReaction,
    handleDeleteReaction,
    selectedReaction,
    reactions,
    showReactions,
    setShowReactions,
    setSelectedReaction,
    profile,
    getReactionSummary
}) {
    const [post, setPost] = useState(initialPost);
    const [loading, setLoading] = useState(!initialPost);
    const [commentText, setCommentText] = useState("")

    // replyTo sẽ chứa object { id: parent_id, name: user_name } khi nhấn "Phản hồi"
    const [replyTo, setReplyTo] = useState(null); 

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="text-white">Đang tải...</div>
            </div>
        );
    }

    const handleLocalReaction = (reaction_type) => {
        if (post.user_reacted) {
            handleDeleteReaction(post.id);
            setPost(prev => ({
                ...prev,
                reactions: prev.reactions.filter(r => r.user_id !== profile?.id),
                user_reacted: null
            }));
            setSelectedReaction(prev => { const copy = { ...prev }; delete copy[post.id]; return copy; });
        } else {
            handleReaction(post.id, reaction_type);
            const newReaction = { user_id: profile.id, reaction_type };
            setPost(prev => ({
                ...prev,
                reactions: [...(prev.reactions || []), newReaction],
                user_reacted: reaction_type
            }));
            setSelectedReaction(prev => ({ ...prev, [post.id]: reactions.find(r => r.name === reaction_type) }));
        }
    };

    useEffect(() => {
        const fetchComment = async (post_id) => {
            try {
                const res = await axios.get(api + `comment/${post_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                })
                console.log(post_id)
                if (res.data.success)
                {
                    setPost(prev => ({
                        ...prev,
                        comments: res.data.data,
                        count: res.data.count
                    }));
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchComment(initialPost.id)
    }, [initialPost.id])

    const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
        const res = await axios.post(api + "comment/add", 
        { 
            post_id: post.id, 
            content: commentText,
            parent_id: replyTo?.id || null   // parent_id nếu là reply
        }, 
        {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success) {
            const newComment = {
                ...res.data.data,
                user: {
                    id: profile.id,
                    name: profile.name,
                    image_url: profile.image_url
                },
                replies: []
            };

            setPost(prev => {
                if (newComment.parent_id) {
                    // Nếu là reply, tìm comment cha và thêm vào mảng replies
                    return {
                        ...prev,
                        comments: prev.comments.map(c => {
                            if (c.id === newComment.parent_id) {
                                return {
                                    ...c,
                                    replies: [...c.replies, newComment]
                                };
                            }
                            return c;
                        }),
                        count: (prev.count || 0) + 1
                    };
                } else {
                    // Nếu là comment mới cấp cha
                    return {
                        ...prev,
                        comments: [newComment, ...(prev.comments || [])],
                        count: (prev.count || 0) + 1
                    };
                }
            });

            setCommentText("");  // reset input
            setReplyTo(null);    // reset reply target
        }
    } catch (error) {
        console.log(error);
    }
};


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-[#242526] rounded-lg w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                        Bài viết của {post.user?.name || "Người dùng"}
                    </h2>
                    <button
                        onClick={() => setModalPost(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-700 transition"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                    {post.media && post.media.length > 0 && (
                        <div className="w-full sm:w-3/5 bg-black flex items-center justify-center overflow-auto p-2">
                            <div className="grid gap-1 grid-cols-2 w-full h-fit">
                                {post.media.slice(0, 4).map((media, index) => (
                                    <div key={media.id || index} className="relative cursor-pointer">
                                        <img
                                            src={src + media.media_url}
                                            alt={`media-${index}`}
                                            className="w-full h-full rounded-lg object-cover bg-gray-800"
                                            style={{
                                                maxHeight: post.media.length === 1 ? "400px" : "200px",
                                                minHeight: post.media.length === 1 ? "300px" : "150px"
                                            }}
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}
                                        />
                                        {index === 3 && post.media.length > 4 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-3xl font-bold rounded-lg">
                                                +{post.media.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className={`${post.media && post.media.length > 0 ? 'w-full sm:w-2/5' : 'w-full'} flex flex-col bg-[#242526]`}>
                        <div className="flex-1 overflow-auto">
                            <div className="p-3 sm:p-4 border-b border-gray-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={src + post.user?.image_url}
                                        alt={post.user?.name || "User"}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/40?text=U"; }}
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-white">{post.user?.name || "Người dùng"}</h4>
                                        <p className="text-xs text-gray-400">{post.created_at ? formatLastActive(post.created_at) : "Vừa xong"}</p>
                                    </div>
                                    <MoreHorizontal className="text-gray-400 cursor-pointer hover:text-gray-300 transition" size={20} />
                                </div>

                                {/* Post Content */}
                                <p className="text-sm text-gray-200 mb-3 whitespace-pre-wrap">{post.content || ""}</p>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-3 flex-wrap gap-2">
                                    <div className="flex items-center gap-1">
                                        {getReactionSummary(post.reactions)}
                                    </div>
                                    <div className="flex gap-3">
                                        <span>{post?.count} bình luận</span>
                                        <span>{post.shares_count || 0} lượt chia sẻ</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-around">
                                    <div className="relative inline-block">
                                        <button
                                            onClick={() => handleLocalReaction(reactions[0].name)}
                                            onMouseEnter={() => !post.user_reacted && setShowReactions(post.id)}
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
                                                        onClick={() => handleLocalReaction(r.name)}
                                                        className="cursor-pointer text-2xl hover:scale-125 transition-transform"
                                                    >
                                                        {r.icon}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-600">
                                        <MessageCircle size={18} /> Bình luận
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-600">
                                        <Share2 size={18} /> Chia sẻ
                                    </button>
                                </div>
                            </div>

                            {/* Comment */}
                            <Comment 
                                post={post} 
                                onReply={(parent) => setReplyTo(parent)} 
                            />
                        </div>
                        <div className="p-4 border-t border-gray-700 bg-[#242526]">
                            <div className="flex items-center gap-2">
                                <img
                                    src={src + profile?.image_url}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <form 
                                    onSubmit={handleComment} 
                                    className="flex-1 bg-[#3a3b3c] rounded-full px-4 py-2 flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        placeholder={replyTo ? `Trả lời @${replyTo.name}` : "Viết bình luận..."}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="flex-1 bg-transparent text-sm outline-none text-white placeholder-gray-500"
                                    />
                                    <Smile size={18} className="text-gray-400 cursor-pointer hover:text-gray-300 transition" />
                                    <Camera size={18} className="text-gray-400 cursor-pointer hover:text-gray-300 transition" />
                                    <Gift size={18} className="text-gray-400 cursor-pointer hover:text-gray-300 transition" />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommentPostModal;
