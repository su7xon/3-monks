import React, { useState, useEffect } from 'react';
import { useShop } from '../store';
import { Review } from '../types';
import { useToast } from './Toast';

export const ReviewsList: React.FC<{ productId: string }> = ({ productId }) => {
    const { getProductReviews } = useShop();
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        getProductReviews(productId).then(setReviews);
    }, [productId, getProductReviews]);

    if (reviews.length === 0) {
        return <p className="text-gray-500 italic text-sm text-center py-4">No reviews yet. Be the first to write one!</p>;
    }

    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{review.userName}</span>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-yellow-400 text-sm mb-2">
                        {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export const ReviewForm: React.FC<{ productId: string; productName: string; productImage: string }> = ({ productId, productName, productImage }) => {
    const { addReview } = useShop();
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !comment) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await addReview({
                productId,
                productName,
                productImage,
                userName: name,
                rating,
                comment
            });
            showToast('Review submitted! Pending approval.', 'success');
            setName('');
            setComment('');
            setRating(5);
        } catch (error) {
            showToast('Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-gray-900 outline-none"
                    placeholder="John Doe"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rating</label>
                <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className={`text-2xl transition-all duration-200 hover:scale-110 focus:outline-none ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Review</label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-gray-900 outline-none resize-none"
                    placeholder="Tell us what you think..."
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};
