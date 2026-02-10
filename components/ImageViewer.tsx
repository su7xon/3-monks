import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const touchStart = useRef<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentIndex(initialIndex);
            setScale(1);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, initialIndex]);

    if (!isOpen) return null;

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev + 1) % images.length);
        setScale(1);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        setScale(1);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart.current - touchEnd;

        if (Math.abs(diff) > 50) { // Swipe threshold
            if (diff > 0) handleNext();
            else handlePrev();
        }
        touchStart.current = null;
    };

    const handleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(prev => prev === 1 ? 2.5 : 1);
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col justify-center max-h-screen"
            onClick={onClose}
        >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
                <span className="text-white text-xs font-bold tracking-widest">{currentIndex + 1} / {images.length}</span>
                <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Main Image Area */}
            <div
                className="flex-1 relative flex items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    src={images[currentIndex]}
                    alt={`View ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 cursor-zoom-in"
                    style={{ transform: `scale(${scale})` }}
                    onClick={handleZoom}
                />

                {/* Navigation Buttons (Desktop) */}
                <button
                    onClick={handlePrev}
                    className="hidden md:block absolute left-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <button
                    onClick={handleNext}
                    className="hidden md:block absolute right-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* Thumbnails */}
            <div className="p-4 flex gap-2 overflow-x-auto justify-center z-20 bg-gradient-to-t from-black/50 to-transparent" onClick={(e) => e.stopPropagation()}>
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setCurrentIndex(idx); setScale(1); }}
                        className={`w-12 h-16 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all ${currentIndex === idx ? 'border-white opacity-100' : 'border-transparent opacity-50'}`}
                    >
                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};

export default ImageViewer;
