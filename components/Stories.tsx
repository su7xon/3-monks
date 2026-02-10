import React from 'react';
import { useShop } from '../store';
import { Link } from 'react-router-dom';

const Stories: React.FC = () => {
    const { stories } = useShop();

    if (!stories || stories.length === 0) return null;

    return (
        <section className="py-6 md:py-8 bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {stories.map((story) => (
                        <Link
                            key={story.id}
                            to={story.link || '/shop'}
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
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stories;
