'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, CheckCircle2, XCircle, Loader2, RefreshCw, ArrowLeft, Shield, Upload, Info, ChevronRight, Check } from 'lucide-react';
import { submitAttendance } from '@/lib/attendanceService';
import Link from 'next/link';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const isInitializingRef = useRef(false);

  // Aggressive camera track termination
  const stopCameraTracks = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }

      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video.srcObject instanceof MediaStream) {
          video.srcObject.getTracks().forEach(track => {
            track.stop();
          });
          video.srcObject = null;
        }
      });
      
      // Clear any library-injected canvases or elements that might linger
      const scannerInjected = document.querySelectorAll('#reader canvas, #reader img, #reader span');
      scannerInjected.forEach(el => el.remove());
    } catch (e) {
      console.error("Manual track stop failed:", e);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (processingRef.current || loading || scanResult) return;
    
    processingRef.current = true;
    setLoading(true);
    
    try {
      // Step 1: Immediately halt scanning state
      setIsScanning(false);
      
      // Step 2: Stop and clear the scanner instance immediately
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
          await scanner.clear();
        } catch (e) {
          console.warn("Scanner stop/clear warning:", e);
        } finally {
          scannerRef.current = null;
        }
      }
      
      // Step 3: Aggressive manual cleanup
      stopCameraTracks();
      
      // Step 4: Process the scanned data
      const result = await submitAttendance(decodedText);
      if (mountedRef.current) {
        setScanResult(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setScanResult({ success: false, message: 'An error occurred during submission.' });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || processingRef.current) return;

    setLoading(true);
    const html5QrCode = new Html5Qrcode("reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleScanSuccess(decodedText);
    } catch (err) {
      if (mountedRef.current) {
        setScanResult({ success: false, message: 'Could not find a valid QR code in this image.' });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      try {
        await html5QrCode.clear();
      } catch (e) {}
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const initScanner = async () => {
      if (isScanning && !scanResult && !isInitializingRef.current) {
        try {
          isInitializingRef.current = true;
          stopCameraTracks();
          
          if (scannerRef.current) {
            try {
              if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
              }
              await scannerRef.current.clear();
            } catch (e) {}
          }

          if (!mountedRef.current || !isScanning || scanResult) {
            isInitializingRef.current = false;
            return;
          }

          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = { 
            fps: 20, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              if (mountedRef.current && !processingRef.current) {
                handleScanSuccess(decodedText);
              }
            },
            () => {} 
          );
          
          if (mountedRef.current) {
            const videoEl = document.querySelector('#reader video') as HTMLVideoElement;
            if (videoEl && videoEl.srcObject instanceof MediaStream) {
              streamRef.current = videoEl.srcObject;
            }
            setCameraError(null);
          }
        } catch (err: any) {
          if (mountedRef.current) {
            setCameraError("Could not access camera. Try uploading an image.");
          }
        } finally {
          isInitializingRef.current = false;
        }
      }
    };

    initScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop()
            .then(() => scanner.clear())
            .catch(() => {})
            .finally(() => {
              stopCameraTracks();
              scannerRef.current = null;
            });
        } else {
          try {
            scanner.clear();
          } catch (e) {}
          stopCameraTracks();
          scannerRef.current = null;
        }
      } else {
        stopCameraTracks();
      }
    };
  }, [isScanning, scanResult]);

  const resetScanner = () => {
    processingRef.current = false;
    setScanResult(null);
    setIsScanning(true);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '520px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '20px', 
          background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--info)', marginBottom: '4px',
          boxShadow: 'var(--shadow-raised)'
        }}>
          <QrCode size={36} strokeWidth={1.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>Attendance Scanner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Verify your presence in seconds.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="notion-card" style={{ 
        position: 'relative', overflow: 'hidden', padding: 0,
        background: '#fff', borderRadius: '24px', border: '1px solid var(--border)',
        minHeight: '400px', display: 'flex', flexDirection: 'column'
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="loader-ring"></div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '20px' }}>Processing...</p>
            </div>
          </div>
        )}

        {/* Success/Failure State Overlay */}
        {scanResult && (
          <div className="success-state animate-success" style={{ 
            position: 'absolute', inset: 0, zIndex: 80,
            padding: '60px 32px', textAlign: 'center', background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' 
          }}>
            {/* Burst Background for Delight */}
            {scanResult.success && (
              <div className="success-burst">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="burst-line" style={{ '--rot': `${i * 45}deg` } as any}></div>
                ))}
              </div>
            )}

            <div className={`icon-wrapper ${scanResult.success ? 'success' : 'failed'}`}>
              {scanResult.success ? (
                <Check size={44} color="#fff" strokeWidth={3.5} className="animate-pop-elastic" />
              ) : (
                <XCircle size={44} color="var(--danger)" strokeWidth={2.5} className="animate-shake" />
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 2 }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {scanResult.success ? 'Done!' : 'Oops!'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '17px', lineHeight: 1.6, maxWidth: '280px' }}>
                {scanResult.message}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '260px', zIndex: 2 }}>
              <button 
                onClick={resetScanner}
                className="notion-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(35, 131, 226, 0.25)' }}
              >
                <RefreshCw size={18} /> {scanResult.success ? 'Scan Another' : 'Try Again'}
              </button>
              <Link href="/dashboard" style={{ width: '100%' }}>
                <button className="notion-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Return to Dashboard
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Scanner Container - Always present but hidden on result */}
        <div style={{ 
          display: scanResult ? 'none' : 'flex', 
          flexDirection: 'column', flex: 1, position: 'relative' 
        }}>
          <div id="reader-container" style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000' }}>
            <div id="reader" style={{ width: '100%', height: '100%', border: 'none' }}></div>
            <div className="scanner-overlay">
              <div className="scanner-line"></div>
              <div className="scanner-corner top-left"></div>
              <div className="scanner-corner top-right"></div>
              <div className="scanner-corner bottom-left"></div>
              <div className="scanner-corner bottom-right"></div>
            </div>
          </div>
          
          {/* Hidden reader for file scanning */}
          <div id="reader-hidden" style={{ display: 'none' }}></div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cameraError ? (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', background: 'var(--danger-bg)', borderRadius: '12px',
                border: '1px solid rgba(235, 87, 87, 0.1)', color: 'var(--danger)'
              }}>
                <XCircle size={20} />
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{cameraError}</p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'var(--success-bg)', borderRadius: '12px',
                border: '1px solid rgba(15, 123, 108, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="pulse-indicator"></div>
                  <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>
                    Live Camera Active
                  </span>
                </div>
                <Camera size={18} color="var(--success)" opacity={0.7} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="notion-btn-ghost"
                style={{ 
                  flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', 
                  padding: '12px', justifyContent: 'center', borderRadius: '12px', fontWeight: 600
                }}
              >
                <Upload size={18} />
                Upload Image
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ 
        background: 'var(--info-bg)', borderRadius: '16px', padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: '16px', border: '1px solid rgba(35, 131, 226, 0.1)'
      }}>
        <div style={{ color: 'var(--info)', marginTop: '2px' }}>
          <Info size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Testing Note</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Image upload is enabled for development. This ensures you can test without a separate device.
          </p>
        </div>
      </div>

      <style>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #reader {
          border: none !important;
        }
        
        /* NUCLEAR OPTION: Aggressively hide library-injected elements by ID/Class */
        #reader__status_span, 
        #reader__dashboard, 
        #reader__scan_region,
        #qr-shaded-region,
        .html5-qrcode-element { 
          display: none !important; 
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        
        /* Specifically target the grey box and green plus artifacts */
        div[id^="html5-qrcode"] { display: none !important; }
        #reader canvas { display: none !important; }
        #reader img { display: none !important; }
        
        /* Ensure the success state is truly on top */
        .success-state {
          z-index: 999 !important;
        }

        .scanner-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
        }

        .scanner-corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 3px solid #fff;
          opacity: 0.8;
        }
        .top-left { top: 40px; left: 40px; border-right: 0; border-bottom: 0; border-top-left-radius: 12px; }
        .top-right { top: 40px; right: 40px; border-left: 0; border-bottom: 0; border-top-right-radius: 12px; }
        .bottom-left { bottom: 40px; left: 40px; border-right: 0; border-top: 0; border-bottom-left-radius: 12px; }
        .bottom-right { bottom: 40px; right: 40px; border-left: 0; border-top: 0; border-bottom-right-radius: 12px; }

        .scanner-line {
          position: absolute;
          top: 40px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: var(--primary);
          box-shadow: 0 0 15px var(--primary);
          animation: scan 3s ease-in-out infinite;
          z-index: 11;
        }

        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(calc(100% + 170px)); }
        }

        .pulse-indicator {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(15, 123, 108, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(15, 123, 108, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(15, 123, 108, 0); }
          100% { box-shadow: 0 0 0 0 rgba(15, 123, 108, 0); }
        }

        .loader-ring {
          display: inline-block;
          width: 48px;
          height: 48px;
          border: 3px solid var(--info-bg);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .animate-success {
          animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .icon-wrapper {
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
          z-index: 5;
        }

        .icon-wrapper.success {
          background: linear-gradient(135deg, #12b886 0%, #0f7b6c 100%);
          box-shadow: 0 12px 30px rgba(15, 123, 108, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3);
        }

        .icon-wrapper.failed {
          background-color: var(--danger-bg);
          border: 2.5px solid var(--danger);
          box-shadow: 0 8px 20px rgba(235, 87, 87, 0.15);
        }

        /* Delight Effects */
        .success-burst {
          position: absolute;
          width: 200px;
          height: 200px;
          z-index: 1;
        }

        .burst-line {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 40px;
          background: var(--success);
          opacity: 0.15;
          transform-origin: top center;
          border-radius: 2px;
          animation: burst 1s ease-out forwards;
        }

        @keyframes burst {
          0% { transform: translate(-50%, -50%) rotate(var(--rot)) translateY(20px) scaleY(0); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) rotate(var(--rot)) translateY(100px) scaleY(1); opacity: 0; }
        }

        .animate-pop-elastic {
          animation: popElastic 0.6s cubic-bezier(0.34, 1.56, 0.64, 1.2) forwards;
        }

        @keyframes popElastic {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
