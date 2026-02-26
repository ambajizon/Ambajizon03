'use client';

// import { getStories } from '@/app/actions/story';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoryRail() {
    const [stories, setStories] = useState<any[]>([]);
    const [viewingStory, setViewingStory] = useState<any | null>(null);

    useEffect(() => {
        async function load() {
            // const data = await getStories();
            // setStories(data);
            setStories([]); // Mock empty for now until migrated
        }
        load();
    }, []);

    if (stories.length === 0) return null;

    return (
        <>
            {/* Story Rail */}
            <div className="bg-white pt-4 pb-2 px-4 border-b border-gray-50 mb-2">
                {/* Title */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Live Darshan</h3>
                </div>

                {/* Scrollable List */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {stories.map((story) => (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            key={story._id}
                            onClick={() => setViewingStory(story)}
                            className="flex flex-col items-center gap-1 min-w-[60px] flex-shrink-0 group"
                        >
                            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-gray-100">
                                    {/* Mock Image via CSS/Emoji if URL fails, else img */}
                                    {story.mediaUrl ? (
                                        <img src={story.mediaUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🕉️</div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-600 font-medium truncate max-w-full group-hover:text-red-600 transition-colors">
                                {story.sellerId?.shopName || 'Shop'}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Full Screen Story View */}
            <AnimatePresence>
                {viewingStory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
                    >

                        {/* Progress Bar (Mock) */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                onAnimationComplete={() => setViewingStory(null)}
                                className="h-full bg-white w-full"
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setViewingStory(null)}
                            className="absolute top-4 right-4 text-white hover:opacity-75 z-20"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Content */}
                        <div className="w-full h-full relative flex items-center justify-center">
                            <img
                                src={viewingStory.mediaUrl}
                                alt="Story"
                                className="max-w-full max-h-screen object-contain"
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white pb-20">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border border-white/50">
                                        🏪
                                    </div>
                                    <span className="font-bold text-sm">{viewingStory.sellerId?.shopName || 'Ambaji Seller'}</span>
                                    <span className="text-white/60 text-xs">• Just now</span>
                                </div>
                                <p className="text-lg font-medium leading-relaxed">{viewingStory.caption}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
