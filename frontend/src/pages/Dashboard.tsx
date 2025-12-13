import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Post, Pagination } from "../types";
import { postService } from "../services/postService";
import PostCard from "../components/Post";

const formatPostDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${month} ${day}, ${year} • ${hours}:${minutesStr} ${ampm}`;
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [newPostType, setNewPostType] = useState<
    "workout" | "meal" | "progress"
  >("workout");
  const [newPostContent, setNewPostContent] = useState("");
  const [composerLoading, setComposerLoading] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [likingPostId, setLikingPostId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setFeedLoading(true);
    setFeedError(null);
    try {
      const typeParam = filterType === "all" ? undefined : filterType;
      const res = await postService.getPosts(undefined, typeParam, page, 10);
      if (res.success && res.data) {
        setPosts(res.data.posts);
        setPagination(res.data.pagination);
      } else {
        setFeedError(res.message || "Failed to load feed");
      }
    } catch (err: any) {
      setFeedError(err.message || "Failed to load feed");
    } finally {
      setFeedLoading(false);
    }
  }, [user, filterType, page]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      setFeedLoading(true);
      setFeedError(null);
      try {
        const typeParam = filterType === "all" ? undefined : filterType;
        const res = await postService.getPosts(undefined, typeParam, page, 10);
        if (res.success && res.data) {
          setPosts(res.data.posts);
          setPagination(res.data.pagination);
        } else {
          setFeedError(res.message || "Failed to load feed");
        }
      } catch (err: any) {
        setFeedError(err.message || "Failed to load feed");
      } finally {
        setFeedLoading(false);
      }
    };

    loadPosts();
  }, [user, filterType, page]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = newPostContent.trim();
    if (!trimmed) {
      setComposerError("Please enter some content for your post.");
      return;
    }

    setComposerError(null);
    setComposerLoading(true);

    try {
      const res = await postService.createPost({
        type: newPostType,
        content: trimmed,
      });

      if (!res.success) {
        setComposerError(res.message || "Failed to create post.");
        return;
      }

      setNewPostContent("");
      setNewPostType("workout");

      await loadPosts();
    } catch (err: any) {
      setComposerError(err.message || "Failed to create post.");
    } finally {
      setComposerLoading(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;

    setLikingPostId(postId);
    setFeedError(null);

    try {
      const res = await postService.likePost(postId);

      if (!res.success) {
        setFeedError(res.message || "Failed to update like.");
        return;
      }

      await loadPosts();
    } catch (err: any) {
      setFeedError(err.message || "Failed to update like.");
    } finally {
      setLikingPostId(null);
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!user) return;

    setFeedError(null);

    const res = await postService.addComment(postId, text);

    if (!res.success) {
      throw new Error(res.message || "Failed to add comment.");
    }

    await loadPosts();
  };

  const handleAddReply = async (commentId: string, text: string) => {
    if (!user) return;

    setFeedError(null);

    const res = await postService.addReply(commentId, text);

    if (!res.success) {
      throw new Error(res.message || "Failed to add reply.");
    }

    await loadPosts();
  };

  return (
    <>
      <Navbar isAuthenticated={true} onLogout={handleLogout} />
      <div className="p-5 max-w-7xl mx-auto">
        <div className="p-5 bg-gray-100 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome Back,{" "}
            {user?.firstName
              ? user.firstName.charAt(0).toUpperCase() +
                user.firstName.slice(1).toLowerCase()
              : ""}
            !
          </h2>
          <p className="text-gray-700 mb-2">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <button
            type="button"
            onClick={() => handleFilterChange("workout")}
            className={`p-5 rounded-lg text-center transition-colors ${
              filterType === "workout"
                ? "bg-blue-100 ring-2 ring-blue-400"
                : "bg-blue-50 hover:bg-blue-100"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">Workouts</h3>
            <p className="text-gray-600">Track your exercises and routines</p>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("meal")}
            className={`p-5 rounded-lg text-center transition-colors ${
              filterType === "meal"
                ? "bg-purple-100 ring-2 ring-purple-400"
                : "bg-purple-50 hover:bg-purple-100"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">Meals</h3>
            <p className="text-gray-600">Log your nutrition and calories</p>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("progress")}
            className={`p-5 rounded-lg text-center transition-colors ${
              filterType === "progress"
                ? "bg-green-100 ring-2 ring-green-400"
                : "bg-green-50 hover:bg-green-100"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">Progress</h3>
            <p className="text-gray-600">Monitor your fitness journey</p>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className={`p-5 rounded-lg text-center transition-colors ${
              filterType === "all"
                ? "bg-orange-100 ring-2 ring-orange-400"
                : "bg-orange-50 hover:bg-orange-100"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">Social Feed</h3>
            <p className="text-gray-600">View all recent activity</p>
          </button>
        </div>

        <div className="mt-10 p-5 bg-white border border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Create a New Post</h3>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => setNewPostType("workout")}
                className={`px-3 py-1 rounded-full border ${
                  newPostType === "workout"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
              >
                Workout
              </button>
              <button
                type="button"
                onClick={() => setNewPostType("meal")}
                className={`px-3 py-1 rounded-full border ${
                  newPostType === "meal"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                }`}
              >
                Meal
              </button>
              <button
                type="button"
                onClick={() => setNewPostType("progress")}
                className={`px-3 py-1 rounded-full border ${
                  newPostType === "progress"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                }`}
              >
                Progress
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              placeholder="Share your workout, meal, or progress update..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {composerError && (
              <p className="text-sm text-red-600">{composerError}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={composerLoading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                {composerLoading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 p-5 bg-white border border-gray-300 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-xl font-semibold">
              {filterType === "all"
                ? "Your Activity Feed"
                : `Recent ${
                    filterType.charAt(0).toUpperCase() + filterType.slice(1)
                  } Posts`}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("workout")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "workout"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
              >
                Workouts
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("meal")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "meal"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                }`}
              >
                Meals
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("progress")}
                className={`px-3 py-1 rounded-full border ${
                  filterType === "progress"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                }`}
              >
                Progress
              </button>
            </div>
          </div>

          {feedLoading && (
            <p className="text-gray-600 text-sm">Loading feed...</p>
          )}

          {feedError && (
            <p className="text-red-600 text-sm mb-2">{feedError}</p>
          )}

          {!feedLoading && !feedError && posts.length === 0 && (
            <p className="text-gray-600 text-sm">
              No posts yet. Start by logging a workout or meal!
            </p>
          )}

          {!feedLoading && !feedError && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  formatPostDate={formatPostDate}
                  currentUserId={user?.id}
                  onToggleLike={handleToggleLike}
                  onAddComment={handleAddComment}
                  onAddReply={handleAddReply}
                  liking={likingPostId === post._id}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-end items-center gap-3 mt-4 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  pagination.hasMore === false || page >= pagination.totalPages
                }
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 p-5 bg-white border border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
          <p className="mb-3">
            This is your fitness tracking dashboard. Here you can:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Log your workouts and track exercises</li>
            <li>Record meals and monitor nutrition</li>
            <li>Track your progress with weight, PRs, and photos</li>
            <li>Share your fitness journey with others</li>
            <li>View and interact with other users' posts</li>
          </ul>
          <p className="mt-4 italic text-gray-600">
            More features coming soon...
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
