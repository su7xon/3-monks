import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="pt-20 md:pt-32 pb-10 md:pb-20 bg-white min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-2 md:mb-4 block italic font-light">Connections</span>
            <h1 className="text-3xl md:text-8xl font-oswald font-bold uppercase tracking-tighter mb-6 md:mb-12 text-gray-900">Reach Out</h1>

            <div className="space-y-6 md:space-y-12 mb-8 md:mb-16">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6 md:gap-12">
                <div>
                  <h3 className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-gray-400 mb-2 md:mb-4">Store Location</h3>
                  <p className="text-xs md:text-sm font-light leading-relaxed text-gray-500">
                    Panchakki Chauraha,<br />
                    M&S Tower<br />
                    Haldwani, Uttarakhand<br />
                    India
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-gray-400 mb-2 md:mb-4">Contact</h3>
                  <p className="text-xs md:text-sm font-light leading-relaxed text-gray-500">
                    info@the3monks.in<br />
                    +91 9045848613<br />
                    Daily: 10AM - 9PM
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-md font-sans">

              <a href="https://wa.me/919045848613" target="_blank" rel="noopener noreferrer" className="relative w-full bg-[#25D366] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] group overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.15l-.3-.18-3.12.82.83-3.04-.19-.31a8.154 8.154 0 01-1.25-4.43c0-4.51 3.67-8.18 8.18-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.51-3.67 8.18-8.18 8.18zm4.52-6.13c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.07-.39-2.03-1.25-.76-.68-1.27-1.51-1.42-1.77-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.37 1 2.7.12.33 1.74 2.66 4.23 3.73 2.48 1.07 1.83.91 2.53.86.7-.06 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.22-.18-.47-.31z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-none mb-0.5 tracking-wide">WHATSAPP</h3>
                      <p className="text-[10px] text-white/90 font-medium">Fastest Response</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex justify-between items-center">
                    <p className="text-sm font-bold tracking-tight">+91 90458 48613</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 group-hover:translate-x-1 transition-transform flex items-center gap-1">Chat →</p>
                  </div>
                </div>
              </a>

              <a href="tel:+919045848613" className="relative w-full bg-[#111827] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] group overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-none mb-0.5 tracking-wide">CALL US</h3>
                      <p className="text-[10px] text-white/60 font-medium">10AM - 7PM</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <p className="text-sm font-bold tracking-tight">+91 90458 48613</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:translate-x-1 transition-transform flex items-center gap-1">Call →</p>
                  </div>
                </div>
              </a>

              <a href="mailto:info@the3monks.in" className="relative w-full bg-[#EF4444] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] group overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-none mb-0.5 tracking-wide">EMAIL</h3>
                      <p className="text-[10px] text-white/90 font-medium">For Inquiries</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex justify-between items-center">
                    <p className="text-sm font-bold tracking-tight truncate max-w-[150px]">info@the3monks.in</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 group-hover:translate-x-1 transition-transform flex items-center gap-1">Email →</p>
                  </div>
                </div>
              </a>

              <a href="https://www.instagram.com/the_3monks_clo?igsh=aWticW9nY3E4djdr" target="_blank" rel="noopener noreferrer" className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] group overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.153 1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.451 2.535c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-none mb-0.5 tracking-wide">INSTAGRAM</h3>
                      <p className="text-[10px] text-white/90 font-medium">Direct Support</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex justify-between items-center">
                    <p className="text-sm font-bold tracking-tight">@the_3monks_clo</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 group-hover:translate-x-1 transition-transform flex items-center gap-1">Follow →</p>
                  </div>
                </div>
              </a>

            </div>
          </div>

          <div className="h-[250px] md:h-[400px] lg:h-auto min-h-[200px] md:min-h-[350px] border border-gray-200 overflow-hidden relative group rounded-xl shadow-sm">
            <iframe
              src="https://maps.google.com/maps?q=The+III+Monks+-+Clothing+Store+in+Haldwani&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              title="Store Location"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-[10px] md:border-[15px] border-white/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
