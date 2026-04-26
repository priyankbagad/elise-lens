import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white py-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* Top row */}
        <div className="grid grid-cols-4 gap-8 mb-12">

          {/* Brand column */}
          <div className="col-span-1">
            <div
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              <span className="text-white">Elise</span>
              <span className="text-[#A855F7]"> Lens</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI-powered lead enrichment built for modern sales teams.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span className="text-gray-400 text-sm">All systems operational</span>
            </div>
          </div>

          {/* Product column */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="/dashboard" className="hover:text-[#A855F7] transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/enrich" className="hover:text-[#A855F7] transition-colors">
                  Enrich Lead
                </a>
              </li>
              <li>
                <a href="/dashboard/analytics" className="hover:text-[#A855F7] transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <a href="/dashboard/pipeline" className="hover:text-[#A855F7] transition-colors">
                  Lead Pipeline
                </a>
              </li>
            </ul>
          </div>

          {/* APIs column */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Powered By
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Census Bureau API</li>
              <li>FRED Economics API</li>
              <li>NewsAPI</li>
              <li>Wikipedia API</li>
              <li>Claude AI (Anthropic)</li>
            </ul>
          </div>

          {/* Built for column */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Built For
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>SDRs &amp; AEs</li>
              <li>Sales Leadership</li>
              <li>Revenue Operations</li>
              <li>GTM Teams</li>
            </ul>
            <div className="mt-6">
              <span className="bg-[#7C3AED]/20 text-[#A855F7] text-xs px-3 py-1 rounded-full border border-[#7C3AED]/30">
                Sales Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            © 2026 Elise Lens · Built by Priyank Bagad
          </p>
        </div>

      </div>
    </footer>
  );
}
