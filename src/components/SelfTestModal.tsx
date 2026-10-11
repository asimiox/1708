import React, { useState } from 'react';
import { X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { SelfTestReport } from '../utils/tests';

interface SelfTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SelfTestReport;
  onRerun: () => void;
}

export const SelfTestModal: React.FC<SelfTestModalProps> = ({ isOpen, onClose, report, onRerun }) => {
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      onRerun();
      setIsRunning(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/35 transition-opacity">
      <div 
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-[var(--paper-2)] rounded-[20px] border border-[var(--border)] p-6 text-[var(--ink)] flex flex-col gap-4 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selftest-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-[12px] flex items-center justify-center text-[var(--ink)] opacity-65 hover:opacity-100 hover:bg-[var(--paper)] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="pr-8">
          <h2 id="selftest-title" className="font-serif text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-tight">
            Verification tests
          </h2>
        </div>

        <p className="text-[13px] text-[var(--ink)] opacity-65 leading-relaxed">
          Automated tests confirm solvability, mathematical determinism, and invalid move guards.
        </p>

        <div className="space-y-2">
          {report.tests.map(t => (
            <div
              key={t.id}
              className="p-3 rounded-[12px] border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{t.name}</span>
                {t.passed ? (
                  <span className="flex items-center gap-1 text-[13px] text-[var(--ink)] opacity-65">
                    <Check className="w-3.5 h-3.5 stroke-[1.5]" /> Pass
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[13px] text-[var(--ink)] font-bold">
                    <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" /> Fail
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[var(--ink)] opacity-65 mt-1">{t.details}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleRerun}
            disabled={isRunning}
            className="flex-1 h-11 border border-[var(--border)] bg-[var(--paper-2)] hover:bg-[var(--paper)] text-[var(--ink)] text-[15px] font-medium rounded-[12px] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 stroke-[1.5] ${isRunning ? 'animate-spin' : ''}`} />
            Run tests
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 text-[15px] font-medium rounded-[12px] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
