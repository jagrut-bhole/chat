"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";

const FRAME_COUNT = 40;
const CANVAS_WIDTH = 1920; // Assume standard width, will scale to fit
const CANVAS_HEIGHT = 1080;

export default function ProximityScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Scroll progress for the entire container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Smooth scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        mass: 0.1,
        stiffness: 100,
        damping: 20,
        restDelta: 0.001
    });

    // Map scroll progress to frame index
    const frameIndex = useTransform(smoothProgress, [0, 1], [1, FRAME_COUNT]);

    // Preload images
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            const promises: Promise<void>[] = [];

            for (let i = 1; i <= FRAME_COUNT; i++) {
                const promise = new Promise<void>((resolve, reject) => {
                    const img = new Image();
                    // Pad index with leading zeros: 1 -> 001, 10 -> 010
                    const formattedIndex = i.toString().padStart(3, "0");
                    img.src = `/frames/ezgif-frame-${formattedIndex}.jpg`;
                    img.onload = () => {
                        loadedImages[i] = img; // Store at correct index (1-based for convenience logic, or adjust)
                        resolve();
                    };
                    img.onerror = () => {
                        console.error(`Failed to load frame ${i}`);
                        resolve(); // Resolve anyway to continue
                    };
                });
                promises.push(promise);
            }

            await Promise.all(promises);
            // Filter empty slots if any fails
            setImages(loadedImages);
            setIsLoading(false);
        };

        loadImages();
    }, []);

    // Render function using useCallback so it can be called from resize handler
    const render = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = images[Math.floor(index)];

        if (canvas && ctx && img) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio); // Cover
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                centerShift_x,
                centerShift_y,
                img.width * ratio,
                img.height * ratio
            );
        }
    }, [images]);

    // Sync Canvas with Scroll
    useEffect(() => {
        // Subscribe to frameIndex changes
        const unsubscribe = frameIndex.on("change", (latest) => {
            const idx = Math.max(1, Math.min(FRAME_COUNT, Math.round(latest)));
            requestAnimationFrame(() => render(idx));
        });

        // Initial render
        if (!isLoading && images.length > 0) {
            render(1);
        }

        return () => unsubscribe();
    }, [frameIndex, isLoading, images, render]);


    // Resize observer to handle window resize for canvas resolution
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);

                // Re-render current frame immediately to avoid blank canvas
                const currentIdx = frameIndex.get();
                const idx = Math.max(1, Math.min(FRAME_COUNT, Math.round(currentIdx)));
                render(idx);
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial setup
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [frameIndex, images, render]); // Added images and render dependency to ensure we can render if resized after load

    // Opacity Transforms for Text - using smoothProgress
    const opacity1 = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
    const opacity2 = useTransform(smoothProgress, [0.15, 0.25, 0.40, 0.50], [0, 1, 1, 0]);
    const opacity3 = useTransform(smoothProgress, [0.40, 0.50, 0.65, 0.75], [0, 1, 1, 0]);
    const opacity4 = useTransform(smoothProgress, [0.65, 0.75, 0.85, 0.95], [0, 1, 1, 0]);
    const opacity5 = useTransform(smoothProgress, [0.85, 0.95, 1], [0, 1, 1]);

    // Visual Effects
    // 1. Initial Blur: Reduced blur at 0, gone by 15%
    const blurFilter = useTransform(smoothProgress, [0, 0.15], ["blur(4px)", "blur(0px)"]);

    // 2. End Overlay: Darken smoothly as the final text appears
    const endOverlayOpacity = useTransform(smoothProgress, [0.8, 0.95], [0, 0.7]);

    return (
        <div ref={containerRef} className="relative h-[400vh] w-full bg-[#050505]">

            {/* Sticky Canvas Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-400 z-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-current"></div>
                    </div>
                )}

                {/* Canvas with motion blur */}
                <motion.canvas
                    ref={canvasRef}
                    className="h-full w-full object-cover"
                    style={{
                        width: '100%',
                        height: '100%',
                        filter: blurFilter
                    }}
                />

                {/* Vignette / Mask Effect - always visible to fade edges */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#050505_100%)] z-10" />

                {/* End-state Dark Overlay */}
                <motion.div
                    style={{ opacity: endOverlayOpacity }}
                    className="absolute inset-0 bg-black pointer-events-none z-20"
                />

                {/* Grain/Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-30"></div>

                {/* Bottom Fade Mask */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent z-30 pointer-events-none" />
            </div>

            {/* Text Overlays - Positioned Absolute over the sticky container? 
          No, they need to be sticky too or fixed, changed by scroll position.
          Since we use ONE sticky container for 400vh, we can put absolute elements inside it
          that respond to the same scroll progress.
       */}

            <div className="sticky top-0 h-screen w-full pointer-events-none flex flex-col justify-center items-center z-40 -mt-[100vh]">
                {/* Section 1: Hero */}
                <motion.div style={{ opacity: opacity1 }} className="absolute text-center max-w-4xl px-4">
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white/90 mb-4">
                        You're never alone.
                    </h1>
                </motion.div>

                {/* Section 2: Closer */}
                <motion.div style={{ opacity: opacity2 }} className="absolute left-10 md:left-24 top-1/2 -translate-y-1/2 max-w-md">
                    <p className="text-3xl md:text-5xl font-semibold text-white/80 mb-2">
                        People are closer than you think.
                    </p>
                </motion.div>

                {/* Section 3: Anonymous */}
                <motion.div style={{ opacity: opacity3 }} className="absolute right-10 md:right-24 top-1/2 -translate-y-1/2 max-w-md text-right">
                    <h2 className="text-3xl md:text-5xl font-semibold text-white/80 mb-2">Connect anonymously.</h2>
                    <p className="text-xl text-white/50">No profiles. No pressure.</p>
                </motion.div>

                {/* Section 4: Real Proxy */}
                <motion.div style={{ opacity: opacity4 }} className="absolute left-10 md:left-32 top-1/2 -translate-y-1/2">
                    <h2 className="text-3xl md:text-5xl font-semibold text-white/80 mb-2">
                        Real conversations.
                    </h2>
                    <h2 className="text-3xl md:text-5xl font-semibold text-white/80 mb-2">
                        Real proximity.
                    </h2>
                </motion.div>

                {/* Section 5: CTA */}
                <motion.div style={{ opacity: opacity5 }} className="absolute text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">
                        Join the conversation.
                    </h2>
                    <button className="pointer-events-auto bg-white text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        Get Started
                    </button>
                </motion.div>
            </div>

        </div>
    );
}
