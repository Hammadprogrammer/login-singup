"use client";

import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white text-black border-t border-gray-200 overflow-x-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
          
          {/* 1. Brand Identity */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-[0.1em] uppercase text-black">
              CLOTHING BRAND
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 max-w-xs font-medium">
              Timeless silhouettes designed for the modern woman. Inspired by tradition, crafted for today.
            </p>
            <div className="flex gap-6 pt-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="text-black hover:scale-110 transition-all duration-300">
                  <Icon size={20} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Links Section (Mobile Side-by-Side) */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-1">
            {/* Shop Links */}
            <div>
              <h3 className="text-[13px] font-black mb-8 uppercase tracking-[0.15em] text-black">Shop</h3>
              <ul className="space-y-4 text-[14px]">
                {['New In', 'Ready To Wear', 'Couture', 'Unstitched'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="group relative py-1 font-bold text-black transition-all duration-300 hover:font-black">
                      {item}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-[13px] font-black mb-8 uppercase tracking-[0.15em] text-black">Support</h3>
              <ul className="space-y-4 text-[14px]">
                {['Shipping', 'Returns', 'FAQs', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="group relative py-1 font-bold text-black transition-all duration-300 hover:font-black">
                      {item}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Contact Info */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black mb-8 uppercase tracking-[0.15em] text-black">Visit Us</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-[14px] font-bold group cursor-default">
                <div className="p-2 border-2 border-black rounded-full group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <span className="text-black">Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-4 text-[14px] font-bold group cursor-default">
                <div className="p-2 border-2 border-black rounded-full group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <Phone size={16} strokeWidth={2.5} />
                </div>
                <span className="text-black">+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-4 text-[14px] font-bold group cursor-default">
                <div className="p-2 border-2 border-black rounded-full group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <Mail size={16} strokeWidth={2.5} />
                </div>
                <span className="text-black">hello@brand.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-10 border-t border-black flex flex-col items-center gap-4">
          <p className="text-[11px] tracking-[0.1em] text-black uppercase font-black">
            © {currentYear} CLOTHING BRAND. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}