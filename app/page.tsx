"use client";

import ProximityScroll from "@/components/ProximityScroll";
import Link from "next/link";
import BentoGrid01 from "@/components/ui/bento-grid";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
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

        <div className="max-w-4xl mx-auto text-center relative z-20">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white">
            Ready to go <span className="text-white">unseen?</span>
          </h2>
          <button 
            onClick={() => router.push('/signup')}
            className="bg-white text-black cursor-pointer px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
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