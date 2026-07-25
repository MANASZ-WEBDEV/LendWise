import React, { useState, useRef, useCallback } from 'react';
import { formatINR } from '../lib/currency';

interface SwipeToCollectProps {
  interestAmount: number;
  daysSinceLastCollection: number;
  daysUntilAvailable: number;
  isAvailable: boolean;
  lastCollectionDate: string;
  onCollect: () => Promise<void>;
}

export const SwipeToCollect: React.FC<SwipeToCollectProps> = ({
  interestAmount,
  daysSinceLastCollection,
  daysUntilAvailable,
  isAvailable,
  lastCollectionDate,
  onCollect,
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const trackWidthRef = useRef(0);

  const THUMB_SIZE = 48;
  const THRESHOLD = 0.80; // 80% of track width to trigger

  const getMaxDrag = useCallback(() => {
    return trackWidthRef.current - THUMB_SIZE;
  }, []);

  const handleStart = useCallback((clientX: number) => {
    if (!isAvailable || isCollecting) return;
    const track = trackRef.current;
    if (!track) return;

    trackWidthRef.current = track.getBoundingClientRect().width;
    startXRef.current = clientX;
    setIsDragging(true);
  }, [isAvailable, isCollecting]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - startXRef.current;
    const maxDrag = getMaxDrag();
    const clamped = Math.max(0, Math.min(delta, maxDrag));
    setDragX(clamped);
  }, [isDragging, getMaxDrag]);

  const handleEnd = useCallback(async () => {
    if (!isDragging) return;
    setIsDragging(false);

    const maxDrag = getMaxDrag();
    const ratio = dragX / maxDrag;

    if (ratio >= THRESHOLD) {
      // Trigger collection
      const confirmed = window.confirm(
        `Collect ${formatINR(interestAmount)} as quarterly interest payment?\n\n` +
        `This will record a repayment of ${formatINR(interestAmount)} (interest only) ` +
        `for the past ${daysSinceLastCollection} days since last collection.`
      );

      if (confirmed) {
        setIsCollecting(true);
        setDragX(maxDrag); // keep at end during collection
        try {
          await onCollect();
        } finally {
          setIsCollecting(false);
          setDragX(0);
        }
      } else {
        setDragX(0);
      }
    } else {
      // Snap back
      setDragX(0);
    }
  }, [isDragging, dragX, getMaxDrag, interestAmount, daysSinceLastCollection, onCollect]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  // Attach global move/end listeners when dragging
  React.useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const maxDrag = trackWidthRef.current ? trackWidthRef.current - THUMB_SIZE : 0;
  const progress = maxDrag > 0 ? dragX / maxDrag : 0;

  return (
    <div className="bg-[#fff8f3] border border-[#ddbfc6] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#1e1b17] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#620032] text-lg">timer</span>
            Quarterly Interest Collection
          </h4>
          <p className="text-[11px] text-[#574147] font-['JetBrains_Mono'] mt-0.5">
            Last collected: {lastCollectionDate}
          </p>
        </div>
        <div className="text-right">
          <span className={`font-['JetBrains_Mono'] text-xs font-bold px-2.5 py-1 rounded-full ${
            isAvailable
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-[#faf2ec] text-[#574147] border border-[#ddbfc6]'
          }`}>
            {isAvailable
              ? `${daysSinceLastCollection} days — Ready!`
              : `${daysUntilAvailable} days left`
            }
          </span>
        </div>
      </div>

      {/* Interest Amount */}
      {isAvailable && interestAmount > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <span className="text-xs font-['JetBrains_Mono'] text-emerald-700 font-semibold">
            Accrued Interest to Collect
          </span>
          <span className="font-['JetBrains_Mono'] text-base font-bold text-emerald-900">
            {formatINR(interestAmount)}
          </span>
        </div>
      )}

      {/* Swipe Track */}
      <div
        ref={trackRef}
        className={`relative h-14 rounded-full overflow-hidden select-none ${
          isAvailable
            ? 'bg-gradient-to-r from-[#620032] to-[#8b004a] cursor-grab'
            : 'bg-[#e5e2da] cursor-not-allowed'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Progress fill */}
        {isAvailable && dragX > 0 && (
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500/30 rounded-full transition-none"
            style={{ width: `${(progress * 100).toFixed(1)}%` }}
          />
        )}

        {/* Center label */}
        <div className={`absolute inset-0 flex items-center justify-center font-['JetBrains_Mono'] text-xs font-bold tracking-wide transition-opacity ${
          isDragging ? 'opacity-30' : 'opacity-100'
        } ${isAvailable ? 'text-white/80' : 'text-[#8a7077]'}`}>
          {isCollecting
            ? 'Recording...'
            : isAvailable
              ? '→ Swipe to Collect Interest →'
              : `Available in ${daysUntilAvailable} days`
          }
        </div>

        {/* Draggable thumb */}
        {isAvailable && (
          <div
            className={`absolute top-1 left-1 w-12 h-12 rounded-full flex items-center justify-center shadow-md z-10 ${
              isDragging
                ? 'bg-white scale-110'
                : isCollecting
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white hover:scale-105'
            } transition-transform`}
            style={{
              transform: `translateX(${dragX}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            {isCollecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[#620032] text-xl">
                {progress >= THRESHOLD ? 'check' : 'chevron_right'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator for mobile */}
      {isAvailable && !isDragging && !isCollecting && (
        <p className="text-center text-[10px] text-[#574147] font-['JetBrains_Mono'] animate-pulse">
          Drag the circle to the right to collect interest
        </p>
      )}
    </div>
  );
};
