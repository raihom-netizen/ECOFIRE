
import React, { useState, useRef, useEffect } from 'react';

interface ImageComparisonProps {
  beforeUrl: string;
  afterUrl: string;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ beforeUrl, afterUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden cursor-col-resize select-none bg-gray-200 border border-gray-200 shadow-xl"
      onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
      onTouchMove={handleMove}
      onMouseDown={handleMove}
    >
      {/* After Image */}
      <img src={afterUrl} alt="After" className="absolute top-0 left-0 w-full h-full object-contain bg-white" />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-white z-10"
        style={{ width: `${sliderPos}%` }}
      >
        <img src={beforeUrl} alt="Before" className="absolute top-0 left-0 w-auto h-full object-contain max-w-none" style={{ width: containerRef.current?.offsetWidth }} />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Original</div>
      </div>

      <div className="absolute top-4 right-4 bg-indigo-600/80 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm z-20">Enhanced</div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white z-30 shadow-[0_0_10px_rgba(0,0,0,0.3)] pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 7l-5 5 5 5V7zm8 0l5 5-5 5V7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
