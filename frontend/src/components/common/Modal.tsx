import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-espresso/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-page-in">
      <div className="bg-cream rounded-2xl shadow-2xl shadow-espresso/20 w-full max-w-md max-h-[90vh] overflow-y-auto border border-espresso/5">
        <div className="flex items-center justify-between px-6 py-4 border-b border-espresso/8">
          <h2 className="font-display text-lg font-medium text-espresso">{title}</h2>
          <button onClick={onClose} className="text-espresso/30 hover:text-espresso/60 transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}