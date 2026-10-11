import React from 'react';

interface ConfirmNewPuzzleModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmNewPuzzleModal: React.FC<ConfirmNewPuzzleModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/35 transition-opacity">
      <div
        className="w-full max-w-[340px] bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-new-puzzle-title"
      >
        <div>
          <h2
            id="confirm-new-puzzle-title"
            className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight"
          >
            Start a new puzzle?
          </h2>
          <p className="mt-1 text-[15px] text-[var(--ink)] opacity-65">
            Your current progress will be lost.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 h-11 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] text-[var(--ink)] text-[15px] font-medium rounded-[12px] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]/90 active:bg-[var(--ink)]/80 text-[15px] font-medium rounded-[12px] transition cursor-pointer shadow-xs"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
