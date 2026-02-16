"use client";

import ProximityScroll from "@/components/ProximityScroll";
import Link from "next/link";
import BentoGrid01 from "@/components/ui/bento-grid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Scrollytelling Section */}
      <ProximityScroll />

      {/* Features */}
      <section className="min-h-screen flex justify-center">
        <BentoGrid01 />
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 w-full py-32 px-6 border-t border-white/5 bg-[#050505] overflow-hidden">
        {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FFD1]/10 blur-[120px] rounded-full pointer-events-none" /> */}

        <div className="max-w-4xl mx-auto text-center relative z-20">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white">
            Ready to go <span className="text-white">unseen?</span>
          </h2>
          <button className="bg-white text-black cursor-pointer px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
            Get Started
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full py-8 text-center text-white/20 text-sm border-t border-white/5 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Proximity Labs. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group p-8 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#00FFD1]/30 transition-all duration-300 hover:bg-[#0F0F0F]">
      <div className="mb-6 p-4 rounded-full bg-white/5 w-fit group-hover:bg-[#00FFD1]/10 transition-colors text-white group-hover:text-[#00FFD1]">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white/90 group-hover:text-white">{title}</h3>
      <p className="text-white/50 leading-relaxed text-sm group-hover:text-white/70 transition-colors">
        {desc}
      </p>
    </div>
  );
}
