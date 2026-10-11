import React from 'react';
import { X } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/35 transition-opacity">
      <div 
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-[12px] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 hover:bg-[var(--paper)] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="pr-8">
          <h2 id="how-to-play-title" className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight">
            How to play 1708
          </h2>
        </div>

        <div className="space-y-3.5 text-[13px] text-[var(--ink)] opacity-65 leading-relaxed">
          <div className="p-3 bg-[var(--paper)] rounded-[12px] border border-[var(--border)]">
            <p className="text-[var(--ink)] font-medium text-[15px]">
              The target number is always exactly <span className="font-serif text-[17px] text-[var(--ink)] font-bold">1708</span>.
            </p>
            <p className="mt-1 text-[13px] text-[var(--ink)] opacity-65">
              You start with 5 tiles and 9 operation tokens. Reach 1708 on any tile before tokens run out.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[var(--ink)] text-[15px] mb-2">
              Operations
            </h3>
            <div className="space-y-1.5 text-[13px]">
              <div className="p-2 rounded-[12px] bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[var(--ink)] font-medium">[ADD] a + b:</span> Pick 2 tiles, remove both, add sum.
              </div>
              <div className="p-2 rounded-[12px] bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[var(--ink)] font-medium">[SUB] |a - b|:</span> Pick 2 tiles, remove both, add absolute difference.
              </div>
              <div className="p-2 rounded-[12px] bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[var(--ink)] font-medium">[MUL] a × b:</span> Pick 2 tiles, remove both, add product.
              </div>
              <div className="p-2 rounded-[12px] bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[var(--ink)] font-medium">[SQ] a²:</span> Pick 1 tile, replace with square.
              </div>
              <div className="p-2 rounded-[12px] bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[var(--ink)] font-medium">[POW] aᵃ (2 ≤ a ≤ 5):</span> 2²=4, 3³=27, 4⁴=256, 5⁵=3125.
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[var(--ink)] text-[15px] mb-1.5">
              Restricted moves
            </h3>
            <ul className="list-disc pl-4 space-y-0.5 text-[13px] text-[var(--ink)] opacity-65">
              <li>Power on 0, 1, or numbers greater than 5</li>
              <li>Square on 0 or 1</li>
              <li>Multiply by 1</li>
              <li>Add with 0</li>
              <li>Subtract of two equal tiles (result 0)</li>
              <li>Any move whose result equals one of its inputs</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-[var(--ink)] text-[15px] mb-1">
              Modes
            </h3>
            <p className="text-[13px]">
              <strong className="text-[var(--ink)] font-medium">Daily</strong> (same puzzle worldwide), <strong className="text-[var(--ink)] font-medium">Classic</strong> (tiles 1, 3, 5, 7, 9), <strong className="text-[var(--ink)] font-medium">Founder</strong> (Classic with 7 × 244 blocked), and <strong className="text-[var(--ink)] font-medium">Practice</strong> (unlimited verified puzzles).
            </p>
          </div>

          <div className="p-3 rounded-[12px] bg-[var(--paper)] border border-[var(--border)] text-[13px]">
            <span className="text-[var(--ink)] font-semibold block">
              The founder route
            </span>
            <p className="text-[var(--ink)] opacity-65 mt-0.5">
              Solve with winning move 7 × 244 to unlock the founder route.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 font-medium rounded-[12px] transition text-[15px] mt-1 cursor-pointer"
        >
          Understood
        </button>
      </div>
    </div>
  );
};
