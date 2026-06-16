import React from "react";
import { ScanHistoryItem } from "../types";
import { Landmark, Calendar, Trash2, ChevronRight, MapPin } from "lucide-react";

interface TravelLogbookProps {
  history: ScanHistoryItem[];
  activeId: string | null;
  onSelect: (item: ScanHistoryItem) => void;
  onClear: () => void;
  onDeleteOne: (id: string, e: React.MouseEvent) => void;
}

export default function TravelLogbook({
  history,
  activeId,
  onSelect,
  onClear,
  onDeleteOne
}: TravelLogbookProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-3 text-white/30 border border-white/10">
          <Landmark className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-white/80 mb-1">Your Travel Logbook is Empty</h4>
        <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
          Take a photo using your camera, upload a landscape image, or scan a preset landmark to unlock detailed AI tours!
        </p>
      </div>
    );
  }

  return (
    <div id="travel-logbook-panel" className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-blue-400" />
            Travel Logbook ({history.length})
          </h4>
          <p className="text-[10px] text-white/40 mt-0.5 font-sans">Persisted travel journal</p>
        </div>
        <button
          id="btn-clear-logbook"
          onClick={onClear}
          className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/10 cursor-pointer transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isSelected = activeId === item.id;
          const { details } = item;
          return (
            <div
              key={item.id}
              id={`log-item-${item.id}`}
              onClick={() => onSelect(item)}
              className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-500/10 border-blue-400 shadow-lg text-white"
                  : "bg-black/25 border-white/10 hover:border-white/20 hover:bg-[#0c0e12]/60 hover:text-white"
              }`}
            >
              {/* Image Preview */}
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                <img
                  src={item.imageUri}
                  alt={details.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {details.name}
                </h5>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono mt-0.5">
                  <span className="truncate max-w-[120px]">{details.city}</span>
                  <span>•</span>
                  <div className="flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5 text-white/30" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  id={`delete-btn-${item.id}`}
                  onClick={(e) => onDeleteOne(item.id, e)}
                  title="Delete Entry"
                  className="p-1 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-white/50 hover:text-red-400 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="text-white/30 group-hover:text-blue-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
