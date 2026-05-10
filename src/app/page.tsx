"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code, Cpu, Globe, Rocket, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="premium-gradient" />
      
      {/* Navigation */}
      <nav style={{ 
        padding: "24px 5%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        zIndex: 10,
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(5, 5, 5, 0.8)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "Outfit" }}>
          PFE<span style={{ color: "var(--primary)" }}>.HUB</span>
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link href="#features" style={{ opacity: 0.7, fontWeight: 500 }}>Features</Link>
          <Link href="#about" style={{ opacity: 0.7, fontWeight: 500 }}>About</Link>
          <button className="btn-primary" style={{ padding: "10px 20px" }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, padding: "80px 5%" }}>
        <motion.section 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ 
            maxWidth: "1000px", 
            margin: "0 auto", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px"
          }}
        >
          <motion.div variants={item} style={{ 
            padding: "8px 16px", 
            background: "rgba(16, 185, 129, 0.1)", 
            color: "var(--primary)",
            borderRadius: "100px",
            fontSize: "14px",
            fontWeight: 600,
            border: "1px solid rgba(16, 185, 129, 0.2)"
          }}>
            ✨ Next.js 15 & React 19 Ready
          </motion.div>
          
          <motion.h1 variants={item} style={{ fontSize: "clamp(40px, 8vw, 80px)", lineHeight: 1.1 }}>
            Build Your <span style={{ 
              background: "linear-gradient(to right, #10b981, #3b82f6)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>Masterpiece</span>
          </motion.h1>
          
          <motion.p variants={item} style={{ 
            fontSize: "clamp(16px, 2vw, 20px)", 
            color: "rgba(255,255,255,0.6)",
            maxWidth: "600px"
          }}>
            A premium starting point for your Final Year Project. Scalable, performant, and designed to impress your jury.
          </motion.p>
          
          <motion.div variants={item} style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <button className="btn-primary">
              Launch Project <Rocket size={18} />
            </button>
            <button style={{ 
              background: "transparent", 
              color: "#fff", 
              border: "1px solid var(--card-border)",
              padding: "12px 28px",
              borderRadius: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              View Demo
            </button>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={container}
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "24px",
              width: "100%",
              marginTop: "80px"
            }}
          >
            {[
              { icon: <Zap color="#10b981" />, title: "Ultra Fast", desc: "Optimized for speed and core web vitals." },
              { icon: <Cpu color="#3b82f6" />, title: "Modern Tech", desc: "Built with Next.js 15 and React 19." },
              { icon: <Globe color="#f59e0b" />, title: "Scalable", desc: "Ready for global production deployment." }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={item} className="glass-card" style={{ padding: "32px", textAlign: "left" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "12px", 
                  background: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px"
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: "12px", fontSize: "20px" }}>{feature.title}</h3>
                <p style={{ opacity: 0.6, fontSize: "15px" }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </main>

      <footer style={{ 
        padding: "40px 5%", 
        borderTop: "1px solid var(--card-border)", 
        textAlign: "center",
        opacity: 0.5,
        fontSize: "14px"
      }}>
        © 2024 PFE.HUB - Built with Passion by Antigravity
      </footer>
    </div>
  );
}
