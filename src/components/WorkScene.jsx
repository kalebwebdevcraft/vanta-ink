import React from 'react';
import FlashArt from './FlashArt';

const TONES = {
  warm: 'from-[#7a4e3a] via-[#5a3626] to-[#2e1a11]',
  deep: 'from-[#4a2f20] via-[#2f1c12] to-[#150b07]',
  pale: 'from-[#c99a80] via-[#9c6e55] to-[#5d3b2b]',
};

const RATIOS = {
  tall: 'aspect-[3/4]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  wide: 'aspect-[4/3]',
};

/**
 * A "photo" of a finished tattoo.
 * Shows the real photo when piece.img exists, otherwise a drawn placeholder on skin.
 */
export default function WorkScene({ piece, className = '', fresh = false, ratio = true }) {
  return (
    <div className={`relative overflow-hidden ${ratio ? RATIOS[piece.ratio] : 'h-full w-full'} ${className}`}>
      {piece.img ? (
        <img src={piece.img} alt={piece.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${TONES[piece.tone]}`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,235,215,0.22),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center p-[16%]">
            <FlashArt
              art={piece.art}
              className="w-full h-full text-[#0b0c12]"
              // fresh ink looks slightly soft and bold, healed looks crisp and settled
            />
          </div>
          {fresh && (
            <>
              <div className="absolute inset-0 bg-red-700/30 mix-blend-multiply" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,120,110,0.28),transparent_70%)]" />
            </>
          )}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.55)]" />
        </>
      )}
    </div>
  );
}