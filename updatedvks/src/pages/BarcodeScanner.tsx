import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Flashlight, FlashlightOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanner } from '../hooks/useScanner';
import { useShop } from '../context/ShopContext';
import toast from 'react-hot-toast';

export const BarcodeScanner: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { stock } = useShop();
    
    const mode = (searchParams.get('mode') as 'SINGLE' | 'BULK') || 'SINGLE';
    const target = searchParams.get('target') || 'stock'; 
    
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [bulkResults, setBulkResults] = useState<string[]>([]);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleConfirm = useCallback((code: string) => {
        if (isRedirecting) return;
        
        // ✅ FIX: Validate barcode is non-empty before processing
        const cleanCode = (code || '').trim();
        if (!cleanCode) {
            toast.error('Barcode read nahi ho saka');
            return;
        }
        
        setScannedResult(cleanCode); // ✅ FIX: Set result BEFORE redirecting
        setIsRedirecting(true);

        // Short delay for visual feedback
        redirectTimeoutRef.current = setTimeout(() => {
            try {
                // Priority 1: If we are in Sale Mode (target=sale)
                if (target === 'sale') {
                    // ✅ FIX: First check if product exists, then navigate with proper params
                    const existingItem = stock.find(s => s.sku === cleanCode || s.id === cleanCode);
                    if (existingItem) {
                        toast.success(`${existingItem.name} cart mein add ho raha hai...`, { id: 'scan-sale' });
                        navigate(`/add-sale?scanned_barcode=${encodeURIComponent(cleanCode)}`, { replace: true });
                    } else {
                        toast.error('Pehle product add karein, phir sale karein', { id: 'scan-new' });
                        navigate(`/add-item?barcode=${encodeURIComponent(cleanCode)}`, { replace: true });
                    }
                    return;
                }

                // Priority 2: Check if product exists in inventory (Stock Mode)
                const existingProduct = stock.find(s => String(s.sku) === cleanCode || String(s.id) === cleanCode);
                if (existingProduct) {
                    toast.success("Product mil gaya!", { id: 'scan-success' });
                    navigate(`/stock/${existingProduct.id}`, { replace: true });
                } else {
                    toast.error("Naya product! Details bharein.", { id: 'scan-new' });
                    navigate(`/add-item?barcode=${encodeURIComponent(cleanCode)}`, { replace: true });
                }
            } catch (err) {
                console.error('Scanner navigation error:', err);
                toast.error('Navigation mein masla hua, wapis jayen');
                setIsRedirecting(false);
            }
        }, 300);
    }, [navigate, stock, target, isRedirecting]);

    const {
        videoRef, status, hasError, torch, 
        toggleTorch, startCamera, stopHardware
    } = useScanner({
        mode,
        onScan: (barcode) => {
            if (mode === 'SINGLE') {
                setScannedResult(barcode);
                handleConfirm(barcode); // Auto confirm for single mode
            } else {
                setBulkResults(prev => {
                    if (prev.includes(barcode)) return prev;
                    return [...prev, barcode];
                });
                toast.success(`Scanned: ${barcode}`, { id: barcode, duration: 1000 });
            }
        }
    });

    useEffect(() => {
        startCamera();
        return () => {
            stopHardware();
            if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
        };
    }, [startCamera, stopHardware]);

    return (
        <div className="fixed inset-0 z-[200] bg-black font-outfit overflow-hidden">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay />
            <div className="absolute inset-0 bg-black/40" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-5 pt-12 flex items-center justify-between z-50">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-90 transition-transform">
                    <ArrowLeft className="text-white" />
                </button>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'SCANNING' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                    <p className="text-white font-black text-[12px] uppercase tracking-wider">{mode} MODE</p>
                </div>
                <button onClick={toggleTorch} className="w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-90 transition-transform">
                    {torch ? <Flashlight className="text-[#4BFF94]" /> : <FlashlightOff className="text-white" />}
                </button>
            </div>

            {/* Center HUD */}
            {status === 'SCANNING' && !isRedirecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-72 h-44 border-2 border-dashed border-white/30 rounded-3xl">
                        <motion.div 
                            animate={{ top: ['5%', '95%', '5%'] }} 
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-1 right-1 h-[2px] bg-[#4BFF94] shadow-[0_0_15px_#4BFF94]"
                        />
                        
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#4BFF94] rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#4BFF94] rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#4BFF94] rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#4BFF94] rounded-br-lg" />
                    </div>
                </div>
            )}

            {/* Redirecting Overlay */}
            <AnimatePresence>
                {isRedirecting && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 rounded-3xl bg-[#4BFF94] flex items-center justify-center shadow-[0_0_50px_rgba(75,255,148,0.4)]"
                        >
                            <Check size={48} className="text-[#0A3D24]" strokeWidth={4} />
                        </motion.div>
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-white font-black text-2xl mt-8"
                        >
                            {scannedResult}
                        </motion.p>
                        <p className="text-white/40 font-bold text-sm mt-2 uppercase tracking-[0.2em]">Redirecting...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BULK SCAN SUMMARY */}
            <AnimatePresence>
                {mode === 'BULK' && !isRedirecting && (
                    <div className="absolute bottom-10 left-5 right-5 z-[60]">
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="bg-black/80 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-white font-black text-[18px]">Bulk Scanning</h4>
                                    <p className="text-[#4BFF94] text-[11px] font-black uppercase tracking-widest">{bulkResults.length} Items Collected</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/bulk-scan')}
                                    className="bg-[#4BFF94] text-[#0A3D24] px-6 py-3 rounded-2xl font-black text-[14px] flex items-center gap-2 active:scale-95 transition-transform"
                                >
                                    Review <ArrowLeft className="rotate-180" size={16} />
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {bulkResults.length === 0 ? (
                                    <p className="text-white/20 text-[12px] font-bold py-2">Scan barcodes to add to list...</p>
                                ) : (
                                    bulkResults.map((code, i) => (
                                        <motion.div 
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            key={i} className="flex-shrink-0 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white/80 font-mono text-[12px]"
                                        >
                                            {code}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center bg-black/90 z-[200]">
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                        <FlashlightOff size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-white font-black text-2xl mb-2">Camera Error</h2>
                    <p className="text-white/40 font-bold mb-8">Please check camera permissions in your browser settings.</p>
                    <button onClick={startCamera} className="bg-[#4BFF94] text-[#0A3D24] px-10 py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform">Retry Permission</button>
                    <button onClick={() => navigate(-1)} className="mt-6 text-white/40 font-black uppercase tracking-widest text-[12px]">Go Back</button>
                </div>
            )}
        </div>
    );
};
