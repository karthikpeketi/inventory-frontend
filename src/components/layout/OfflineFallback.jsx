import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineFallback = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center items-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5 flex-1">
            
            {/* Lucide Icon */}
            <div className="flex justify-center pt-5">
              <WifiOff className="w-24 h-24 text-primary" /> {/* Medium-Large Icon */}
            </div>

            <h2 className="text-foreground tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Unable to connect
            </h2>
            <p className="text-foreground text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              There seems to be a problem with your internet connection. Please check your network settings and try again.
            </p>
            <div className="flex px-4 py-3 justify-center">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-primary-foreground text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={() => window.location.reload()}
              >
                <span className="truncate">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
