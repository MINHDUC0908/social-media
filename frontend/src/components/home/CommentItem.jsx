import { useState } from "react";
import src from "../../api/src";
import { formatLastActive } from "../../utils/format";

function CommentItem({ comment, allComments, onReply, depth = 0 }) {
    const [showReplies, setShowReplies] = useState(false);

    const replies = comment.replies || [];
    const hasReplies = replies.length > 0;
    const isNested = depth > 0;

    const getParentUser = (parent_id) => {
        if (!parent_id) return null;
        return allComments.find(c => c.id === parent_id)?.user?.name || "Người dùng";
    };

    const handleReplyClick = () => {
        onReply({ id: comment.id, name: comment.user?.name });
    };

    return (
        <div className="relative">
            {/* Đường dọc nối xuyên suốt (chỉ hiện khi có reply) */}
            {hasReplies && (
                <div
                    className="absolute left-4 top-8 bottom-0 w-px bg-gray-600 opacity-50"
                    style={{ left: "15px" }} // chính xác 32px / 2
                />
            )}

            <div className="flex gap-2 relative">
                {/* Avatar + đường ngang nối vào nếu là reply */}
                <div className="relative flex-shrink-0">
                    {/* Đường ngang nối từ avatar vào đường dọc (chỉ với reply) */}
                    {isNested && (
                        <div
                            className="absolute top-4 left-0 w-4 h-px bg-gray-600 opacity-50 -translate-x-full"
                            style={{ width: "15px" }}
                        />
                    )}

                    <img
                        src={src + comment.user?.image_url}
                        alt={comment.user?.name}
                        className="w-8 h-8 rounded-full object-cover relative z-10 border border-gray-800"
                    />
                </div>

                {/* Nội dung bình luận */}
                <div className="flex-1 min-w-0">
                    <div className="inline-block max-w-full">
                        <div className="bg-[#3a3b3c] rounded-2xl px-3 py-2 text-sm leading-snug">
                            <span className="font-medium text-white block">
                                {comment.user?.name}
                            </span>
                            <span className="text-gray-100 break-words">
                                {comment.parent_id && (
                                    <span className="text-blue-400 font-medium mr-1">
                                        @{getParentUser(comment.parent_id)}{" "}
                                    </span>
                                )}
                                {comment.content}
                            </span>
                        </div>
                    </div>

                    {/* Dòng hành động: Thích · Phản hồi · Thời gian */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-medium">
                        <button className="hover:underline">Thích</button>
                        <button onClick={handleReplyClick} className="hover:underline">
                            Phản hồi
                        </button>
                        <span className="text-gray-500">
                            {formatLastActive(comment.created_at)}
                        </span>
                    </div>

                    {/* Danh sách trả lời (lồng ghép) */}
                    {hasReplies && (
                        <div className="mt-1">
                            {!showReplies ? (
                                <div>
                                    {replies.slice(0, 1).map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            allComments={allComments}
                                            onReply={onReply}
                                            depth={depth + 1}
                                        />
                                    ))}
                                    {replies.length > 1 && (
                                        <button
                                            onClick={() => setShowReplies(true)}
                                            className="ml-11 mt-1 text-xs font-medium text-gray-400 hover:underline"
                                        >
                                            Xem thêm {replies.length - 1} phản hồi
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {replies.map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            allComments={allComments}
                                            onReply={onReply}
                                            depth={depth + 1}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommentItem;