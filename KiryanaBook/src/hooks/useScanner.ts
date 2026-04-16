import { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { BarcodeScanner as NativeScanner, BarcodeFormat as NativeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import toast from 'react-hot-toast';

export type ScanMode = 'SINGLE' | 'BULK';
export type ScanStatus = 'IDLE' | 'SCANNING' | 'PAUSED';

interface UseScannerProps {
  mode: ScanMode;
  onScan: (barcode: string) => void;
  throttleMs?: number;
}

// ✅ Stable ref helper to prevent useCallback re-creation on every render
function useStableRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * 🚀 UNIFIED SCANNER ENGINE (PRO STATE MACHINE)
 * Separates Hardware Control from Scanning logic.
 */
export const useScanner = (props: UseScannerProps) => {
  const { mode, onScan, throttleMs = 500 } = props;

  const [status, setStatus] = useState<ScanStatus>('SCANNING');
  const [hasError, setHasError] = useState(false);
  const [torch, setTorch] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef<ScanStatus>('SCANNING');
  const lastScanTimeRef = useRef<number>(0);
  const bulkSetRef = useRef<Set<string>>(new Set());
  // ✅ FIX: Store onScan in a stable ref — prevents startCamera from recreating on every render
  const onScanRef = useStableRef(onScan);
  // ✅ FIX: Guard flag to prevent native scanner from firing twice
  const hasScannedRef = useRef(false);

  // Sync ref with state for use in callbacks
  useEffect(() => { statusRef.current = status; }, [status]);

  const triggerHaptic = () => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});

  const stopHardware = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch (e) {}
      controlsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // ✅ FIX: handleBarcodeResponse no longer depends on onScan (uses stable ref instead)
  const handleBarcodeResponse = useCallback((barcode: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < throttleMs) return;
    if (statusRef.current !== 'SCANNING') return;

    lastScanTimeRef.current = now;
    triggerHaptic();
    
    // State machine logic
    if (mode === 'SINGLE') {
      setStatus('PAUSED'); // STOP SCAN (not camera)
    }

    onScanRef.current(barcode);
  }, [mode, throttleMs]); // ✅ onScan removed from deps — no more re-creation loop

  const startCamera = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      // ✅ FIX: Prevent native scanner from re-opening after a scan has already happened
      if (hasScannedRef.current) return;
      try {
        const { camera } = await NativeScanner.requestPermissions();
        if (camera !== 'granted') return toast.error('Camera permission required');
        
        const { barcodes } = await NativeScanner.scan({
          formats: [NativeFormat.Ean13, NativeFormat.Ean8, NativeFormat.Code128]
        });
        if (barcodes.length > 0) {
          hasScannedRef.current = true; // ✅ Mark as scanned — block any re-trigger
          handleBarcodeResponse(barcodes[0].displayValue);
        }
      } catch (err) {
        setHasError(true);
      }
      return;
    }

    if (!videoRef.current) return;
    setHasError(false);

    try {
      const hints = new Map<DecodeHintType, any>();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128, BarcodeFormat.UPC_A
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 480 } }
      };

      const controls = await reader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result) => {
          if (result) handleBarcodeResponse(result.getText());
        }
      );

      controlsRef.current = controls;
      streamRef.current = videoRef.current.srcObject as MediaStream;
    } catch (err) {
      console.error('Camera fail:', err);
      setHasError(true);
    }
  }, [handleBarcodeResponse]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities() as any;
      if (caps.torch) {
        await (track as any).applyConstraints({ advanced: [{ torch: !torch }] });
        setTorch(!torch);
      }
    } catch (e) {}
  };

  const resumeScanning = () => {
    setStatus('SCANNING');
    lastScanTimeRef.current = 0;
  };

  const clearBulkHistory = () => {
    bulkSetRef.current.clear();
  };

  return {
    videoRef,
    status,
    setStatus,
    hasError,
    torch,
    toggleTorch,
    resumeScanning,
    startCamera,
    stopHardware,
    clearBulkHistory
  };
};
