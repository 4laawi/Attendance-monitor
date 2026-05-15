"use client";

import { motion } from "framer-motion";
import { 
  Plus, 
  ArrowRight,
  CheckCircle2,
  Users,
  LayoutDashboard,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Menu
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" as const } 
    },
  } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      {/* Navigation */}
      <nav style={{ 
        padding: "16px 5%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        zIndex: 1000
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: "32px", height: "32px", borderRadius: "6px", 
            background: "#444", display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>PFE Hub</span>
        </div>
        
        <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
          <Link href="#features" className="notion-btn-ghost" style={{ color: "var(--text-muted)" }}>Features</Link>
          <Link href="#about" className="notion-btn-ghost" style={{ color: "var(--text-muted)" }}>About</Link>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/dashboard" className="notion-btn-primary" style={{ fontWeight: 600 }}>
                Dashboard <LayoutDashboard size={16} />
              </Link>
              <button 
                onClick={() => logout()}
                className="notion-btn-ghost" 
                style={{ color: "var(--danger)", fontWeight: 600 }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="notion-btn-ghost" style={{ fontWeight: 600 }}>Log in</Link>
              <Link href="/register" className="notion-btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden notion-btn-ghost"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={20} />
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{ 
          padding: "120px 5% 80px",
          maxWidth: "1100px", 
          margin: "0 auto",
          textAlign: "center"
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              background: "var(--info-bg)", 
              color: "var(--primary)", 
              padding: "6px 12px", 
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "24px"
            }}>
              <Zap size={14} />
              Introducing Version 2.4
            </div>
            <h1 style={{ 
              fontSize: "clamp(48px, 8vw, 72px)", 
              lineHeight: 1.1, 
              marginBottom: "24px",
              fontWeight: 800,
              letterSpacing: "-0.04em"
            }}>
              The ultimate workspace for <br/>
              <span style={{ color: "var(--primary)" }}>academic projects.</span>
            </h1>
            <p style={{ 
              fontSize: "20px", 
              color: "var(--text-muted)", 
              maxWidth: "700px", 
              margin: "0 auto 40px",
              lineHeight: 1.6
            }}>
              Orchestrate your graduation research with mathematical precision. 
              Track attendance, manage milestones, and collaborate seamlessly.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <Link href={user ? "/dashboard" : "/login"} className="notion-btn-primary" style={{ padding: "12px 24px", fontSize: "16px" }}>
                {user ? "Go to Dashboard" : "Launch Platform"} <ArrowRight size={18} />
              </Link>
              <button className="notion-btn-ghost" style={{ padding: "12px 24px", fontSize: "16px", border: "1px solid var(--border)" }}>
                View Documentation
              </button>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" style={{ 
          padding: "80px 5%",
          maxWidth: "1100px", 
          margin: "0 auto"
        }}>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
              gap: "24px" 
            }}
          >
            {[
              {
                icon: LayoutDashboard,
                title: "Central Dashboard",
                desc: "Monitor all active projects and attendance metrics in one place with clean analytics."
              },
              {
                icon: Globe,
                title: "Live Attendance",
                desc: "Real-time presence tracking via secure QR scanning for students and faculty."
              },
              {
                icon: Lock,
                title: "Enterprise Security",
                desc: "Industrial-grade encryption for all research assets and student data privacy."
              },
              {
                icon: Zap,
                title: "Fast Collaboration",
                desc: "Instant notifications and seamless communication between coordinators and teams."
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Organize students into classes and projects with role-based access control."
              },
              {
                icon: CheckCircle2,
                title: "Milestone Tracking",
                desc: "Keep your project on schedule with automated deadlines and status updates."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="notion-card"
                style={{ padding: "32px" }}
              >
                <div style={{ 
                  width: "48px", height: "48px", borderRadius: "10px", 
                  background: "var(--surface)", display: "flex", 
                  alignItems: "center", justifyContent: "center",
                  marginBottom: "24px", color: "var(--primary)"
                }}>
                  <feature.icon size={24} />
                </div>
                <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>{feature.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: "100px 5%",
          maxWidth: "1100px", 
          margin: "0 auto",
          textAlign: "center"
        }}>
          <div style={{ 
            background: "var(--surface)", 
            padding: "64px", 
            borderRadius: "24px",
            border: "1px solid var(--border)"
          }}>
            <h2 style={{ fontSize: "36px", marginBottom: "16px", letterSpacing: "-0.02em" }}>Ready to engineer your legacy?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "18px", marginBottom: "32px" }}>
              Join hundreds of students and faculty members already using PFE Hub.
            </p>
            <Link href={user ? "/dashboard" : "/register"} className="notion-btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>
              {user ? "Open Workspace" : "Get Started for Free"} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: "64px 5%", 
        borderTop: "1px solid var(--border)",
        background: "#fafafa"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "#444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={14} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: "18px" }}>PFE Hub</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "250px" }}>
              The definitive platform for academic excellence and project orchestration.
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "64px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Product</span>
              <Link href="#" className="notion-btn-ghost" style={{ padding: 0, fontSize: "14px", color: "var(--text-muted)" }}>Features</Link>
              <Link href="#" className="notion-btn-ghost" style={{ padding: 0, fontSize: "14px", color: "var(--text-muted)" }}>Pricing</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Company</span>
              <Link href="#" className="notion-btn-ghost" style={{ padding: 0, fontSize: "14px", color: "var(--text-muted)" }}>About</Link>
              <Link href="#" className="notion-btn-ghost" style={{ padding: 0, fontSize: "14px", color: "var(--text-muted)" }}>Contact</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "1100px", margin: "40px auto 0", paddingTop: "40px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>© 2024 PFE Hub. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="#" style={{ color: "var(--text-muted)", fontSize: "12px", textDecoration: "none" }}>Privacy</Link>
            <Link href="#" style={{ color: "var(--text-muted)", fontSize: "12px", textDecoration: "none" }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

