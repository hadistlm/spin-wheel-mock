import React from 'react';
import { WheelSegment } from '../types';
import { SegmentIcon, AVAILABLE_ICONS } from './Icons';
import { X } from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  currentIcon: WheelSegment['iconName'] | null;
  onClose: () => void;
  onSelect: (icon: WheelSegment['iconName']) => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  currentIcon,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#0F172A] text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Pilih Ikon
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onSelect(icon);
                onClose();
              }}
              title={icon}
              className={`aspect-square rounded-xl flex items-center justify-center transition-all border ${
                currentIcon === icon
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <SegmentIcon name={icon} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
