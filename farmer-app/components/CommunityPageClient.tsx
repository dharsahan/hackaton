'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CommunityPost } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

interface CommunityPageClientProps {
    posts: CommunityPost[];
}

function timeAgo(timestamp: string): string {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Unknown';
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function CommunityPageClient({ posts: initialPosts = [] }: CommunityPageClientProps) {
    const { data: session } = useSession();
    const [posts, setPosts] = useState(initialPosts);
    const [activeTag, setActiveTag] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTags, setNewPostTags] = useState('');

    const allTags = ['All', ...Array.from(new Set((posts || []).flatMap(p => p.tags || [])))];

    const filtered = activeTag === 'All'
        ? (posts || [])
        : (posts || []).filter(p => (p.tags || []).includes(activeTag));

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) {
            alert("Please sign in to post.");
            return;
        }

        if (!newPostContent.trim()) return;

        const postData = {
            author: session.user.name || 'Anonymous',
            authorAvatar: session.user.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk4wl1QwR6U0Trv1hTG7QralNDkeZ7b6BxmOOu4N03SvWdezUz6Aim8ASl_-11KNwaod6UsiD7Nkx_gJSzrLWglADEnpIps7LW4CUR_aEGHGp23teU3sF2LDpaem0kAzfbq8ADqcsoGtCEhVOHTHyw2Vbw0SsrEQKR0wjA8KRK4ybMmXvxVF4Jo_nqrTis1prbFwnr0HBaX3HAjNxAiJAGA0RzllagDsME4e1o-8gd4JSGfcer9VNmiDxAEqGcs7N-EEO573p67Vl',
            content: newPostContent,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            tags: newPostTags.split(',').map(t => t.trim()).filter(t => t !== ''),
            userId: session.user.email || 'anonymous'
        };

        try {
            const docRef = await addDoc(collection(db, 'community_posts'), postData);
            const newPost: CommunityPost = {
                id: docRef.id,
                ...postData
            };
            setPosts([newPost, ...posts]);
            setIsAddModalOpen(false);
            setNewPostContent('');
            setNewPostTags('');
        } catch (error) {
            console.error("Error adding post:", error);
            alert("Failed to add post.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="px-6 pt-6 pb-4 shrink-0 md:pt-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Community</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{posts.length} discussions</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors cursor-pointer flex items-center gap-1"
                    >
                        <span className="material-icons text-sm">add</span>
                        New Post
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 md:px-8 md:pb-8 no-scrollbar">
                {/* Tag Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${activeTag === tag
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Posts */}
                <div className="space-y-3 max-w-2xl">
                    {filtered.map(post => (
                        <article key={post.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            {/* Author */}
                            <div className="flex items-center gap-3 mb-3">
                                <Image
                                    src={post.authorAvatar}
                                    alt={post.author}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                    unoptimized
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.author}</p>
                                    <p className="text-[10px] text-gray-400">{timeAgo(post.timestamp)}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{post.content}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                                <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors cursor-pointer">
                                    <span className="material-icons text-base">favorite_border</span>
                                    <span className="text-xs">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors cursor-pointer">
                                    <span className="material-icons text-base">chat_bubble_outline</span>
                                    <span className="text-xs">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors cursor-pointer ml-auto">
                                    <span className="material-icons text-base">share</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            {/* New Post Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Discussion</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-icons text-gray-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddPost} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content</label>
                                <textarea
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30 min-h-[120px]"
                                    placeholder="What's on your mind?"
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tags (comma separated)</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    placeholder="e.g. Organic, Help, Seeds"
                                    value={newPostTags}
                                    onChange={e => setNewPostTags(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-2"
                            >
                                Post to Community
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
