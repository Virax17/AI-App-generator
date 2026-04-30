"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../lib/auth";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d1117] mesh-bg overflow-x-hidden">
      <main className="mx-auto flex max-w-7xl flex-col gap-24 px-6 py-20">
        
        {/* Hero Section */}
        <section className="relative flex flex-col items-center text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-xs font-bold text-violet-400 uppercase tracking-widest"
          >
            Built for the future of development
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="max-w-4xl text-5xl font-black text-white sm:text-6xl md:text-7xl leading-[1.1] tracking-tight"
          >
            Forge Your Vision <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Instantly From JSON
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 max-w-2xl text-lg text-slate-400 leading-relaxed"
          >
            Skip the boilerplate. Paste a schema and get a fully functional, production-ready 
            application with forms, tables, and auth in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/register"
              className="btn-glow rounded-xl bg-violet-600 px-8 py-4 text-sm font-black text-white hover:bg-violet-700 transition-all"
            >
              Get Started for Free
            </Link>
            <Link
              href="/playground"
              className="rounded-xl border border-slate-700 bg-slate-800/40 px-8 py-4 text-sm font-black text-slate-200 hover:border-slate-500 hover:bg-slate-800 transition-all backdrop-blur-sm"
            >
              Try Live Playground
            </Link>
          </motion.div>

          {/* Floating UI Preview (Mock) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 w-full max-w-5xl rounded-2xl border border-slate-800 bg-[#161b22] p-2 shadow-2xl shadow-violet-500/10"
          >
            <div className="rounded-xl border border-slate-800 bg-[#0d1117] overflow-hidden aspect-video relative flex items-center justify-center">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               <div className="z-10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 rounded-full border border-violet-500/20 mb-4">
                     <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                     <span className="text-[10px] font-bold text-violet-300 uppercase tracking-tighter">Live Engine Active</span>
                  </div>
                  <pre className="text-left text-xs text-slate-500 font-mono p-4 bg-black/40 rounded-lg max-w-md">
                    {`{
  "appName": "Health Monitor",
  "fields": [
    { "name": "patient", "type": "text" },
    { "name": "bpm", "type": "number" }
  ]
}`}
                  </pre>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Rapid Prototyping",
              description: "Turn ideas into working interfaces in minutes. Perfect for MVPs and internal tools.",
              icon: "⚡",
            },
            {
              title: "Self-Healing Engine",
              description: "Handle malformed or inconsistent JSON gracefully with our automated config healer.",
              icon: "🛡️",
            },
            {
              title: "Enterprise Ready",
              description: "Built-in auth, CSV exports, and responsive design for production environments.",
              icon: "🏢",
            },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-3xl p-8 hover:border-violet-500/50 transition-all group"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/20 p-12 text-center mb-20 relative overflow-hidden">
           <div className="absolute -top-24 -right-24 h-64 w-64 bg-violet-500/20 blur-[100px] rounded-full" />
           <h2 className="text-3xl font-black text-white mb-4">Ready to forge your next app?</h2>
           <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join the new era of schema-driven development and build robust apps without the grind.</p>
           <Link
              href="/register"
              className="inline-block bg-white text-[#0d1117] px-8 py-3.5 rounded-xl font-black hover:bg-slate-200 transition-all"
            >
              Create Your Account
            </Link>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
