import React from "react";
import { Post } from "../types";
import Like from "./Like";
import Comment from "./Comment";

interface PostCardProps {
  post: Post;
  formatPostDate: (dateString: string) => string;
  currentUserId?: string;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void | Promise<void>;
  onAddReply?: (commentId: string, text: string) => void | Promise<void>;
  liking?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  formatPostDate,
  currentUserId,
  onToggleLike,
  onAddComment,
  onAddReply,
  liking = false,
}) => {
  const isLikedByUser = currentUserId
    ? post.likes.includes(currentUserId)
    : false;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            User{" "}
            {(post as any).user?.firstName
              ? `${(post as any).user.firstName} ${
                  (post as any).user.lastName || ""
                }`.trim()
              : `User ${post.userId}`}
          </p>
          <p className="text-xs text-gray-500">
            {formatPostDate(post.createdAt)}
          </p>
        </div>

        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
          {post.type}
        </span>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-800">{post.content}</p>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <Like
          isLiked={isLikedByUser}
          count={post.likes.length}
          disabled={liking}
          onToggle={() => onToggleLike(post._id)}
        />

        <Comment
          comments={post.comments}
          onAdd={(text) => onAddComment(post._id, text)}
          onReply={onAddReply}
        />
      </div>
    </div>
  );
};

export default PostCard;
