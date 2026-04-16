import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

interface BarcodeScannerPageProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScannerPage: React.FC<BarcodeScannerPageProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const isProcessingRef = useRef(false);

  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [scanCount, setScanCount] = useState(0);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const hints = new Map<DecodeHintType, any>();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.DATA_MATRIX,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30 },
        },
      };

      const controls = await reader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result) => {
          if (result && !isProcessingRef.current) {
            isProcessingRef.current = true;
            const code = result.getText();
            setLastScanned(code);
            setScanCount((c) => c + 1);
            // Cooldown before next scan
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 1500);
          }
        }
      );

      controlsRef.current = controls;
    } catch (err: any) {
      console.error('Scanner start error:', err);
      if (err?.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser/device settings.');
      } else if (err?.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Could not start camera. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    startScanner();
    return () => {
      controlsRef.current?.stop();
    };
  }, [startScanner]);

  const toggleTorch = async () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] });
        setTorchOn(!torchOn);
      } else {
        alert('Torch not supported on this device');
      }
    } catch {
      console.warn('Torch toggle failed');
    }
  };

  const handleUseBarcode = () => {
    if (lastScanned) {
      onScan(lastScanned);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 9999,
      display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif',
    }}>
      {/* Top Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
      }}>
        <button onClick={onClose} style={btnStyle('#ffffff22')}>
          ✕ Close
        </button>
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>
          📷 Barcode Scanner
        </span>
        <button onClick={toggleTorch} style={btnStyle(torchOn ? '#f59e0b' : '#ffffff22')}>
          {torchOn ? '🔦 On' : '🔦 Off'}
        </button>
      </div>

      {/* Camera View */}
      {cameraError ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
          <p style={{ color: '#ef4444', fontSize: '15px', marginBottom: '16px' }}>{cameraError}</p>
          <button onClick={startScanner} style={btnStyle('#3b82f6')}>Retry</button>
        </div>
      ) : (
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay
          muted
          playsInline
        />
      )}

      {/* Scan Frame Overlay */}
      {!cameraError && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <div style={{
            width: '260px', height: '180px', position: 'relative',
          }}>
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80' },
              { top: 0, right: 0, borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80' },
              { bottom: 0, left: 0, borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80' },
              { bottom: 0, right: 0, borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80' },
            ].map((style, i) => (
              <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...style }} />
            ))}
            {/* Scan line animation */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '2px',
              background: 'linear-gradient(to right, transparent, #4ade80, transparent)',
              animation: 'scanLine 2s ease-in-out infinite',
              top: '50%',
            }} />
          </div>
        </div>
      )}

      {/* Bottom result panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
        padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        {lastScanned ? (
          <>
            <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Scanned ({scanCount}x)
            </p>
            <p style={{
              color: '#4ade80', fontSize: '18px', fontWeight: 800,
              letterSpacing: '2px', marginBottom: '12px',
              fontFamily: 'monospace',
            }}>
              {lastScanned}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleUseBarcode} style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                background: '#4ade80', color: '#000', fontWeight: 700,
                fontSize: '14px', border: 'none', cursor: 'pointer',
              }}>
                ✓ Use This Barcode
              </button>
              <button onClick={() => { setLastScanned(''); setScanCount(0); }} style={{
                padding: '12px 16px', borderRadius: '12px',
                background: '#ffffff22', color: '#fff', fontWeight: 700,
                fontSize: '14px', border: 'none', cursor: 'pointer',
              }}>
                🔄
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '14px' }}>
            Point camera at a barcode to scan
          </p>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

const btnStyle = (bg: string): React.CSSProperties => ({
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
});
