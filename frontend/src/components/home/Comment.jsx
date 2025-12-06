import src from "../../api/src";
import { formatLastActive } from "../../utils/format";
import CommentItem from "./CommentItem";

function Comment({ post, onReply  }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {post.comments?.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
            ) : (
                post.comments?.map((cmt) => (
                    <CommentItem 
                        key={cmt.id} 
                        comment={cmt} 
                        allComments={post.comments} 
                        onReply={onReply}
                    />
                ))
            )}
        </div>
    );
}
export default Comment;
