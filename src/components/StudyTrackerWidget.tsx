/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  RefreshCw,
  Laptop,
} from 'lucide-react';

export const STUDY_TRACKER_APP_URL = 'https://nothing-mu-nine.vercel.app/';

interface StudyTrackerWidgetProps {
  glassBg?: boolean;
}

export const StudyTrackerWidget: React.FC<StudyTrackerWidgetProps> = ({
  glassBg = true,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden rounded-2xl select-none">
      {/* Widget Header without external links or full-screen buttons */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Laptop className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[11px] tracking-wider text-white truncate uppercase font-mono">
              Study Time Tracker
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Active" />
          </div>
        </div>

        {/* Toolbar Controls - Just quick reload */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Study Time Tracker"
            className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 w-full h-full relative bg-[#090a0f] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090a0f]/80 backdrop-blur-sm text-center p-4">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
            <p className="text-xs text-white/80 font-mono font-medium">Loading Study Time Tracker...</p>
          </div>
        )}

        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={STUDY_TRACKER_APP_URL}
          title="Study Time Tracker"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 select-auto"
          allow="fullscreen; autoplay; clipboard-write; encrypted-media; camera; microphone"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export const StudyTrackerFullScreenOverlay: React.FC<{ isOpen?: boolean; onClose?: () => void }> = () => null;

export default StudyTrackerWidget;
