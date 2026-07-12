/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';
import { Sparkles, Megaphone } from 'lucide-react';

interface AdSenseBannerProps {
  /**
   * Optional AdSense Slot ID. If not provided, it can fall back to auto-ads
   * or show a beautifully styled sponsorship placeholder.
   */
  slotId?: string;
  /**
   * Optional manual override for the Google Publisher ID.
   */
  publisherId?: string;
  /**
   * Format of the ad. Default is 'auto'.
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  /**
   * Layout class override
   */
  className?: string;
}

export function AdSenseBanner({
  slotId,
  publisherId,
  format = 'auto',
  className = ''
}: AdSenseBannerProps) {
  const [adError, setAdError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read environment variable or fallback to injected global
  const activePubId = publisherId || (import.meta.env.VITE_ADSENSE_PUBLISHER_ID as string) || '';

  useEffect(() => {
    // Only attempt to push AdSense if we have active configuration
    if (activePubId && slotId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      } catch (err) {
        console.warn('AdSense load deferred or blocked by browser:', err);
        setAdError(true);
      }
    }
  }, [activePubId, slotId]);

  // If there's no custom slot configuration, display a highly polished premium Sponsorship banner.
  // This helps the site look professional out of the box and gives the creator immediate monetization ideas.
  if (!activePubId || !slotId || adError) {
    return (
      <div className={`group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0e1422] dark:to-[#16202f] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-4.5 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 ${className}`} id="adsense-sponsor-card">
        {/* Subtle background glow */}
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/15 transition-all duration-300" />
        
        <div className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              Sponsor Spot
            </span>
            <span className="text-[10px] bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full font-bold">
              Ad Space
            </span>
          </div>

          <div>
            <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5">
              <span>Advertise Your Product Here</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
              Reach thousands of AI enthusiasts, developers, and learners visiting daily for curated resources and updates.
            </p>
          </div>

          <a 
            href="mailto:sponsor@airesourceshub.com?subject=Sponsorship Inquiry - AI Resources Hub" 
            className="w-full text-center py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1b263b] transition-all duration-200 hover:shadow-sm"
          >
            Inquire Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 text-center overflow-hidden ${className}`} id="adsense-active-card">
      <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">
        Advertisement
      </div>
      <div className="min-h-[100px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={activePubId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
