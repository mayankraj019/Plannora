"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
}

export default function DestinationGallery({ destination }: { destination: string }) {
  const [images, setImages] = useState<UnsplashPhoto[]>([]);
  const [selectedImage, setSelectedImage] = useState<UnsplashPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        console.warn("Unsplash Access Key missing. Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env");
        setIsLoading(false);
        return;
      }

      try {
        const destName = destination.split(',')[0].trim();
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destName + " travel landmark")}&per_page=3&client_id=${accessKey}`
        );
        const data = await response.json();
        if (data.results) {
          setImages(data.results);
        }
      } catch (error) {
        console.error("Error fetching Unsplash images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [destination]);

  // Fallback images if API fails or key is missing
  const fallbackImages = [
    `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80`,
    `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80`,
    `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80`,
  ];

  const renderImage = (idx: number) => {
    const img = images[idx];
    const span = idx === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1";
    const src = img ? img.urls.regular : fallbackImages[idx];

    return (
      <motion.div
        key={idx}
        layoutId={`img-${idx}`}
        onClick={() => img && setSelectedImage(img)}
        className={`relative overflow-hidden group ${span} bg-ivory/5 cursor-zoom-in`}
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={src}
          alt={img?.alt_description || destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-2 gap-2 h-64 sm:h-80 w-full rounded-3xl overflow-hidden border border-amber/10 shadow-2xl bg-midnight/20">
        {[0, 1, 2].map(i => renderImage(i))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 bg-midnight/90 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              layoutId={`img-${images.indexOf(selectedImage)}`}
              className="relative max-w-5xl w-full max-h-full rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.urls.regular}
                alt={selectedImage.alt_description}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-display text-lg font-semibold">
                  {selectedImage.alt_description || destination}
                </p>
                <p className="text-white/60 text-xs uppercase tracking-widest mt-1">
                  via Unsplash
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
