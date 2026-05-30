
import React, { useEffect, useState, useRef } from 'react';
import { useShop } from '../store';
import { Review } from '../types';

const DEMO_REVIEWS: Review[] = [
    { id: 'demo_1', userName: "Aarav Sharma", createdAt: new Date("2026-02-10").getTime(), rating: 5, comment: "Bhai kya quality hai! 2026 ka best drop. Fabric is insane 🔥", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_2', userName: "Rohan Verma", createdAt: new Date("2026-02-02").getTime(), rating: 5, comment: "Monks never disappoint. Kapde makhan hain. Highly recommend! ❤️", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_3', userName: "Ishwani Singh", createdAt: new Date("2026-01-28").getTime(), rating: 5, comment: "Vibe hi alag hai iss brand ki. Fits are perfect for street style.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_4', userName: "Kabir Das", createdAt: new Date("2026-01-15").getTime(), rating: 4, comment: "Delivery thoda late thi but product 10/10 hai. Worth the wait.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_5', userName: "Ananya Gupta", createdAt: new Date("2026-01-05").getTime(), rating: 5, comment: "Just wow! The details on the hoodie are crazy. Love it.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_6', userName: "Vikram Malhotra", createdAt: new Date("2025-12-20").getTime(), rating: 5, comment: "Best streetwear brand in India right now. Koi competition nahi hai.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_7', userName: "Sanya Kapoor", createdAt: new Date("2025-12-12").getTime(), rating: 5, comment: "Material bohot premium hai. Feels luxury at this price point.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_8', userName: "Dev Patel", createdAt: new Date("2025-12-01").getTime(), rating: 5, comment: "Ek number fitting! Sab log puch rahe the kahan se liya.", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_9', userName: "Meera Joshi", createdAt: new Date("2025-11-25").getTime(), rating: 4, comment: "Great designs. Bas stock jaldi khatam ho jata hai. Restock please!", productImage: '', productName: '', productId: '', status: 'approved' },
    { id: 'demo_10', userName: "Arjun Reddy", createdAt: new Date("2025-11-10").getTime(), rating: 5, comment: "Solid purchase. Comfortable and stylish. 100% recommended.", productImage: '', productName: '', productId: '', status: 'approved' }
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
        const speed = 1.5;

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
        <section className="py-16 bg-white overflow-hidden">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-5xl font-oswald font-bold tracking-tighter text-[#8B1D3B] mb-2 uppercase">
                    WALL OF LOVE
                </h2>
                <div className="flex justify-center gap-1 text-yellow-500 text-xl mb-4">
                    {'★'.repeat(5)}
                </div>
                <p className="text-[#D1476B] font-medium tracking-wide">
                    Trusted by 500+ souls worldwide.
                </p>
            </div>

            <div className="relative w-full">
                {/* Gradients for fading effect */}
                <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    style={{ scrollBehavior: 'auto' }}
                >
                    <div className="flex gap-6 px-4 md:px-0">
                        {displayReviews.map((review, idx) => (
                            <div
                                key={`${review.id}-${idx}`}
                                className="flex-shrink-0 w-[300px] md:w-[350px] bg-[#FFFDD0] p-6 rounded-2xl shadow-sm border border-yellow-100 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex gap-1 text-yellow-500 text-sm mb-3">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <p className="text-gray-800 italic mb-6 leading-relaxed font-medium">
                                        "{review.comment}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white text-[#D1476B] flex items-center justify-center font-bold shadow-sm text-sm border border-pink-100 uppercase">
                                        {review.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{review.userName}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
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
