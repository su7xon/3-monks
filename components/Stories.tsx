import React from 'react';
import { useShop } from '../store';
import { Link } from 'react-router-dom';

const Stories: React.FC = () => {
    const { stories } = useShop();
    const [selectedStory, setSelectedStory] = React.useState<typeof stories[0] | null>(null);

    if (!stories || stories.length === 0) return null;

    return (
        <>
            <section className="py-6 md:py-8 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {stories.map((story) => (
                            <div
                                key={story.id}
                                onClick={() => setSelectedStory(story)}
                                className="flex flex-col items-center flex-shrink-0 group snap-center cursor-pointer"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                                        <img
                                            src={story.image}
                                            alt={story.title || 'Story'}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                                {story.title && (
                                    <span className="mt-2 text-[10px] md:text-xs font-bold text-gray-900 text-center max-w-[70px] truncate tracking-wide">
                                        {story.title}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Lightbox */}
            {selectedStory && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedStory(null)}
                >
                    <button
                        onClick={() => setSelectedStory(null)}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-[60]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div
                        className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={selectedStory.image}
                            alt={selectedStory.title || 'Story'}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />

                        {(selectedStory.title || selectedStory.subtitle || selectedStory.link) && (
                            <div className="mt-4 text-center text-white">
                                {selectedStory.title && <h3 className="text-xl font-bold">{selectedStory.title}</h3>}
                                {selectedStory.subtitle && <p className="text-sm opacity-80 mt-1">{selectedStory.subtitle}</p>}
                                {selectedStory.link && (
                                    <Link
                                        to={selectedStory.link}
                                        onClick={() => setSelectedStory(null)}
                                        className="inline-block mt-4 bg-white text-black px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-full hover:bg-opacity-90 transition-all"
                                    >
                                        View Details
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Stories;
