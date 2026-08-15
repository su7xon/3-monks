import React, { useEffect, useState, useRef } from 'react';
import { useShop } from '../store';
import { Review } from '../types';

const DEMO_REVIEWS: Review[] = [
    { id: 'demo_1', userName: "Gagandeep Singh", createdAt: new Date("2026-02-10").getTime(), rating: 5, comment: "Amritsar Road tangra Pind muchh Relway fatak", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_2', userName: "Rohan Verma", createdAt: new Date("2026-02-02").getTime(), rating: 5, comment: "Monks never disappoint. Kapde makhan hain. Highly recommend! ❤️", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_3', userName: "Ishwani Singh", createdAt: new Date("2026-01-28").getTime(), rating: 5, comment: "Vibe hi alag hai iss brand ki. Fits are perfect for street style.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_4', userName: "Kabir Das", createdAt: new Date("2026-01-15").getTime(), rating: 4, comment: "Delivery thoda late thi but product 10/10 hai. Worth the wait.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_5', userName: "Ananya Gupta", createdAt: new Date("2026-01-05").getTime(), rating: 5, comment: "Just wow! The details on the hoodie are crazy. Love it.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_6', userName: "Vikram Malhotra", createdAt: new Date("2025-12-20").getTime(), rating: 5, comment: "Best streetwear brand in India right now. Koi competition nahi hai.", productImage: '', productName: '', productId: '', status: 'approved' },
];

const WallOfLove: React.FC = () => {
    const { getApprovedReviews } = useShop();
    const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            const liveReviews = await getApprovedReviews();
            if (liveReviews.length > 0) {
                setReviews([...liveReviews, ...DEMO_REVIEWS]);
            } else {
                setReviews(DEMO_REVIEWS);
            }
        };
        fetchReviews();
    }, [getApprovedReviews]);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationFrameId: number;
        const speed = 1.0;

        const step = () => {
            if (!isPaused && scrollContainer) {
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += speed;
                }
            }
            animationFrameId = requestAnimationFrame(step);
        };

        animationFrameId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, reviews]);

    const displayReviews = reviews.length > 0 ? [...reviews, ...reviews, ...reviews] : [];

    return (
        <section className="py-12 md:py-20 bg-editorial overflow-hidden border-y border-gray-100 relative">
            
            <div className="max-w-7xl mx-auto px-6 mb-8 relative z-10 text-center">
                <span className="text-black font-bold text-[9px] uppercase tracking-[0.2em] mb-2 block">
                    Testimonials
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase text-black">
                    Wall of Love
                </h2>
            </div>

            <div className="relative w-full z-10">
                {}
                <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-editorial to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-editorial to-transparent z-10 pointer-events-none"></div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide py-2"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    style={{ scrollBehavior: 'auto' }}
                >
                    <div className="flex gap-4 md:gap-6 px-4 md:px-6">
                        {displayReviews.map((review, idx) => (
                            <div
                                key={`${review.id}-${idx}`}
                                className="flex-shrink-0 w-[260px] md:w-[320px] bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm border border-gray-100 rounded-lg"
                            >
                                <div>
                                    <div className="flex gap-1 text-black text-xs md:text-sm mb-4">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <p className="text-gray-600 font-serif text-base md:text-lg italic mb-6 leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-black text-[9px] md:text-[10px] uppercase tracking-[0.2em]">— {review.userName}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default WallOfLove;
