import React from 'react';

const OWNER = 'III Monks Lifestyle';
const BRAND = 'THE III MONKS';
const DOMAIN = 'www.monks.com';
const YEAR = new Date().getFullYear();

const CopyrightNotice: React.FC = () => {
  return (
    <div className="w-full bg-[#0b0b0f] text-white rounded-xl md:rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      <div className="bg-white/[0.04] border-b border-white/10 px-4 sm:px-6 md:px-10 py-5 md:py-6">
        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] md:tracking-[0.3em] text-gray-400 font-semibold mb-2 md:mb-3">
          Official Notice · Intellectual Property
        </p>
        <h1 className="text-lg sm:text-xl md:text-3xl font-bold leading-snug md:leading-tight">
          Copyright &amp; Brand Ownership Claim
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-2 break-words">
          Issued by the registered owner of <span className="text-white font-semibold">{DOMAIN}</span>
        </p>
      </div>

      <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 space-y-6 md:space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3">
          {[
            { label: 'Claimant Domain', value: DOMAIN },
            { label: 'Claimed Brand Name', value: BRAND },
            { label: 'Legal Owner', value: OWNER },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.03] border border-white/10 rounded-lg md:rounded-xl px-3.5 md:px-4 py-2.5 md:py-3">
              <p className="text-[9px] uppercase tracking-[0.14em] md:tracking-[0.18em] text-gray-500 font-semibold">{item.label}</p>
              <p className="text-[13px] md:text-sm font-bold text-white mt-1 break-words">{item.value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.22em] text-gray-400 font-bold mb-2">1. Statement of Claim</h2>
          <p className="text-[13px] md:text-[13.5px] leading-relaxed text-gray-300 break-words">
            This notice is formally issued by <span className="font-semibold text-white">{OWNER}</span>, the sole and
            lawful owner and operator of the domain <span className="font-semibold text-white">{DOMAIN}</span>. The
            trade name, brand identity and word mark <span className="font-semibold text-white">&ldquo;{BRAND}&rdquo;</span>{' '}
            ("the Brand") is the original creation of this domain and its owner, and has been used, promoted and
            associated exclusively with <span className="font-semibold text-white">{DOMAIN}</span>.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.22em] text-gray-400 font-bold mb-2">2. Scope of Protected Material</h2>
          <p className="text-[13px] md:text-[13.5px] leading-relaxed text-gray-300 break-words">
            The Brand name, logo, word mark, monograms, artwork, product photographs, design assets, written
            content, source code and overall visual identity displayed on {DOMAIN} are protected works under applicable
            copyright, trade mark and intellectual property laws. All rights, title and interest in such material vest
            solely and exclusively in {OWNER}.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.22em] text-gray-400 font-bold mb-2">3. Claim Against Unauthorised Use</h2>
          <p className="text-[13px] md:text-[13.5px] leading-relaxed text-gray-300 break-words">
            Any individual, business, platform or website using the name &ldquo;{BRAND}&rdquo;, or any colourable
            imitation, deceptively similar variant or confusingly similar mark, without prior written authorisation from{' '}
            {OWNER}, is hereby placed on notice that the exclusive rights in the Brand belong to {DOMAIN}. Such use
            constitutes infringement and may amount to passing off and unfair competition.
          </p>
        </section>

        <section>
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.22em] text-gray-400 font-bold mb-2">4. Prohibited Acts</h2>
          <ul className="text-[13px] md:text-[13.5px] leading-relaxed text-gray-300 list-disc pl-4 md:pl-5 space-y-1.5 break-words">
            <li>Copying, reproducing or imitating the Brand name, logo or brand assets in whole or in part.</li>
            <li>Using the Brand name to sell, advertise or promote goods or services without written permission.</li>
            <li>Registering or using any domain, handle, listing or store name confusingly similar to the Brand.</li>
            <li>Re-uploading, redistributing or reselling content, images or code owned by {DOMAIN}.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.22em] text-gray-400 font-bold mb-2">5. Reservation of Rights</h2>
          <p className="text-[13px] md:text-[13.5px] leading-relaxed text-gray-300 break-words">
            All rights are expressly reserved. The owner of {DOMAIN} reserves the right to initiate takedown requests,
            platform complaints and legal proceedings, and to claim damages and costs, against any party found in
            violation of the rights asserted in this notice. Failure to enforce any right on one occasion is not a
            waiver of that right.
          </p>
        </section>

        <div className="border-t border-white/10 pt-5 md:pt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.14em] md:tracking-[0.18em] text-gray-500 font-semibold">Rights Holder / Claimant</p>
            <p className="text-[13px] md:text-sm font-bold text-white mt-1">{OWNER}</p>
            <a
              href={`https://${DOMAIN}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[13px] md:text-sm font-semibold text-white underline underline-offset-4 decoration-white/30 hover:text-gray-300 break-all"
            >
              {DOMAIN}
            </a>
          </div>
          <p className="text-[10px] md:text-[11px] text-gray-500 text-left sm:text-right leading-relaxed">
            © {YEAR} {OWNER}. All rights reserved.
            <br />
            Notice effective from {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CopyrightNotice;
