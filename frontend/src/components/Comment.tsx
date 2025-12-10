import React, { useState } from 'react';
import { Comment as Comments } from '../types';

interface CommentProps {
  comments: Comments[];
  onAdd: (text: string) => void | Promise<void>;
}

const Comment: React.FC<CommentProps> = ({ comments, onAdd }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await onAdd(trimmed);
      setText('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <div className="space-y-2 mb-3">
        {comments.slice(0, 3).map((c) => (
          <div key={c._id} className="text-xs text-gray-700">
            <span className="font-semibold">User {c.userId}</span>: {c.text}
          </div>
        ))}

        {comments.length > 3 && (
          <p className="text-xs text-blue-600 cursor-pointer hover:underline">
            View all {comments.length} comments
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          placeholder="Add a comment..."
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="text-xs px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Comment;
