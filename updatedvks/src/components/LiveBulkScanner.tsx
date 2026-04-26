import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast';
import { KIRYANA_CATEGORIES } from '../data/kiryanaDatabase';
import { standardizeBrand } from '../utils/productValidation';
import { resizeBase64Image } from '../utils/image';
import { masterBarcodeLookup } from '../services/barcodeService';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { BarcodeScanner as NativeScanner, BarcodeFormat as NativeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';

interface LiveBulkScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onProductFound: (product: any) => void;
}

type ScanStep = 'front' | 'back' | 'analyzing' | 'result';

export const LiveBulkScanner: React.FC<LiveBulkScannerProps> = ({ isOpen, onClose, onProductFound }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [step, setStep] = useState<ScanStep>('front');
    const [capturedImages, setCapturedImages] = useState<{front?: string, back?: string}>({});
    const [isScanning, setIsScanning] = useState(false);
    const [lastProduct, setLastProduct] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
            setStep('front');
            setCapturedImages({});
            setLastProduct(null);
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error('Camera access denied or not available');
            onClose();
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const takePhoto = async () => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const base64Image = await resizeBase64Image(canvas.toDataURL('image/jpeg', 0.8), 800, 0.7);
        
        if (step === 'front') {
            setCapturedImages(prev => ({ ...prev, front: base64Image }));
            setStep('back');
            toast.success('Front image captured! Now show the barcode (back).');
        } else if (step === 'back') {
            setCapturedImages(prev => ({ ...prev, back: base64Image }));
            analyzeImages(capturedImages.front!, base64Image);
        }
    };

    const analyzeImages = async (frontImg: string, backImg: string) => {
        setStep('analyzing');
        setIsScanning(true);
        const toastId = toast.loading('AI is analyzing both sides... 🤖');
        
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            // Reverted to 3.1-flash-lite-preview as requested for higher quota
            const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
            
            // 1. NATIVE BARCODE SCANNING (Ultra Accuracy)
            let nativeBarcode: string | null = null;
            if (backImg && Capacitor.isNativePlatform()) {
                try {
                    const fileName = `temp_bulk_bc_${Date.now()}.jpg`;
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: backImg.split(',')[1],
                        directory: Directory.Cache
                    });
                    
                    const scanResult = await NativeScanner.readBarcodesFromImage({
                        path: savedFile.uri,
                        formats: [NativeFormat.Ean13, NativeFormat.Ean8, NativeFormat.Code128, NativeFormat.UpcA]
                    });

                    if (scanResult.barcodes && scanResult.barcodes.length > 0) {
                        nativeBarcode = scanResult.barcodes[0].displayValue || scanResult.barcodes[0].rawValue || null;
                    }
                    await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }).catch(() => {});
                } catch (err) {
                    console.error('Bulk Native scan failed:', err);
                }
            }

            // 2. AI ANALYSIS for Metadata
            const resizedFront = await resizeBase64Image(frontImg, 1200, 0.8);
            const resizedBack = await resizeBase64Image(backImg, 1200, 0.8);

            const imageParts = [
                { inlineData: { data: resizedFront.split(',')[1], mimeType: "image/jpeg" } },
                { inlineData: { data: resizedBack.split(',')[1], mimeType: "image/jpeg" } }
            ];

            const result = await model.generateContent([
                ...imageParts,
                `Analyze these 2 images (Front and Back). 
                Extract product details and return ONLY a JSON array with ONE object.
                
                Object keys:
                - "name": Full product name
                - "brand": Brand/Company name
                - "category": EXACTLY one from: ${KIRYANA_CATEGORIES.map(c => c.name).join(', ')}
                - "barcode": The numeric barcode digits if visible.
                - "price": Numeric selling price if visible
                - "size": Pack size (e.g. "500ml", "1kg")
                
                Return ONLY valid JSON array.`
            ]);

            const responseText = result.response.text();
            // Robust JSON extraction
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
            const products = JSON.parse(cleanJson);

            if (Array.isArray(products) && products.length > 0) {
                const p = products[0];
                if (!p.name) throw new Error('Could not identify product name');
                
                const finalBarcode = (nativeBarcode || p.barcode || '').trim().replace(/\s/g, '');
                const isValidBarcode = finalBarcode && /^\d{8,14}$/.test(finalBarcode) && finalBarcode.toLowerCase() !== 'null';
                
                if (!isValidBarcode) {
                    toast.error('Barcode saaf nahi hai! 📸', { id: toastId + '-bc', duration: 4000 });
                }
                
                let finalProduct = {
                    name: p.size ? `${p.name} ${p.size}` : p.name,
                    company: standardizeBrand(p.brand || ''),
                    category: p.category || 'General',
                    unit: 'pcs',
                    quantity: 1,
                    buyingPrice: 0,
                    price: Number(p.price) || 0,
                    minThreshold: 5,
                    sku: finalBarcode,
                    packSize: p.size || '',
                    imageUrl: await resizeBase64Image(frontImg, 600, 0.6)
                };

                if (isValidBarcode) {
                    const globalMatch = await masterBarcodeLookup(finalBarcode);
                    if (globalMatch.product) {
                        const gp = globalMatch.product;
                        finalProduct = {
                            ...finalProduct,
                            name: gp.name,
                            company: gp.company,
                            category: gp.category,
                            unit: (gp.unit as any) || 'pcs'
                        };
                    }
                }

                setLastProduct(finalProduct);
                setStep('result');
                toast.success(`Product identified!`, { id: toastId });
            } else {
                toast.error('AI could not recognize the product details.', { id: toastId });
                setStep('front');
                setCapturedImages({});
            }
        } catch (err: any) {
            console.error(err);
            const errMsg = err?.message?.toLowerCase() || '';
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exceeded')) {
                toast.error('AI Limit Reached!', { id: toastId });
            } else {
                toast.error(`Scan failed: ${err.message || 'Check connection'}`, { id: toastId });
            }
            setStep('front');
            setCapturedImages({});
        } finally {
            setIsScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
                className="fixed top-0 left-0 w-full h-[100dvh] z-[300] bg-black flex flex-col font-outfit overflow-hidden"
            >
                <div className="flex-1 relative overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    
                    {/* Top Bar */}
                    <div className="absolute top-14 left-0 right-0 px-6 flex justify-between items-center z-10">
                        <button onClick={onClose} className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-[11px] font-black tracking-widest uppercase">
                                Bulk AI Add
                            </span>
                        </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="absolute top-32 left-0 right-0 px-8 flex gap-2 z-10">
                        <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 'front' ? 'bg-[#4BFF94] shadow-[0_0_10px_#4BFF94]' : (capturedImages.front ? 'bg-[#4BFF94]/40' : 'bg-white/10')}`} />
                        <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 'back' ? 'bg-[#4BFF94] shadow-[0_0_10px_#4BFF94]' : (capturedImages.back ? 'bg-[#4BFF94]/40' : 'bg-white/10')}`} />
                        <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 'analyzing' ? 'bg-[#4BFF94] animate-pulse' : 'bg-white/10'}`} />
                    </div>

                    {/* Instruction Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                        <AnimatePresence mode="wait">
                            {step === 'front' && (
                                <motion.div key="front" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                                    <div className="w-64 h-80 border-2 border-[#4BFF94] rounded-[2rem] border-dashed mb-6 flex items-center justify-center bg-[#4BFF94]/5">
                                        <div className="p-6 rounded-full bg-[#4BFF94]/20">
                                            <Camera size={48} className="text-[#4BFF94]" />
                                        </div>
                                    </div>
                                    <h2 className="text-white text-2xl font-black mb-2">Pehle Front Dikhao</h2>
                                    <p className="text-white/60 font-bold">Product ka naam aur brand saaf nazar aaye</p>
                                </motion.div>
                            )}

                            {step === 'back' && (
                                <motion.div key="back" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                                    <div className="w-64 h-80 border-2 border-[#4BFF94] rounded-[2rem] border-dashed mb-6 flex items-center justify-center bg-[#4BFF94]/5">
                                        <div className="p-6 rounded-full bg-[#4BFF94]/20">
                                            <RefreshCw size={48} className="text-[#4BFF94]" />
                                        </div>
                                    </div>
                                    <h2 className="text-white text-2xl font-black mb-2">Ab Barcode Dikhao</h2>
                                    <p className="text-white/60 font-bold">Product ko ghuma kar barcode side ki photo lein</p>
                                </motion.div>
                            )}

                            {step === 'analyzing' && (
                                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                                    <div className="w-24 h-24 border-4 border-[#4BFF94] border-t-transparent rounded-full animate-spin mb-6" />
                                    <h2 className="text-white text-2xl font-black mb-2">AI Soch Raha Hai...</h2>
                                    <p className="text-white/60 font-bold tracking-widest uppercase">Analyzing Both Sides</p>
                                </motion.div>
                            )}

                            {step === 'result' && lastProduct && (
                                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-full px-6">
                                    <div className="w-20 h-20 bg-[#4BFF94]/20 rounded-3xl flex items-center justify-center mb-6 border border-[#4BFF94]/30">
                                        <Check size={40} className="text-[#4BFF94]" strokeWidth={3} />
                                    </div>
                                    <h2 className="text-white text-xl font-black mb-1">Product Mila!</h2>
                                    <div className="flex flex-col items-center gap-1 mb-2">
                                        <p className="text-[#4BFF94] font-black uppercase text-center text-[15px] tracking-tight line-clamp-2">{lastProduct.name}</p>
                                        {lastProduct.packSize && (
                                            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-black text-white/60 uppercase tracking-widest">{lastProduct.packSize}</span>
                                        )}
                                    </div>
                                    
                                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-8 flex flex-col items-center">
                                        <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Barcode / SKU</span>
                                        <p className="text-white/80 font-mono text-[14px] font-bold tracking-[0.1em]">{lastProduct.sku || 'No Barcode Found'}</p>
                                    </div>

                                    <div className="flex flex-col w-full gap-3">
                                        <button 
                                            onClick={() => {
                                                onProductFound(lastProduct);
                                                setStep('front');
                                                setCapturedImages({});
                                                toast.success('Stock mein add ho gaya! ✅');
                                            }}
                                            className="w-full py-5 bg-[#4BFF94] text-[#0a0a0a] rounded-3xl font-black text-[16px] shadow-[0_15px_35px_rgba(75,255,148,0.25)] active:scale-95 transition-all"
                                        >
                                            Confirm & Add Stock
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setStep('front');
                                                setCapturedImages({});
                                            }}
                                            className="w-full py-4 text-white/40 font-bold text-[14px] active:scale-95"
                                        >
                                            Galti hui, Dobara lein
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Capture Controls */}
                <div className="h-44 bg-[#0a0a0a] rounded-t-[2.5rem] -mt-6 z-10 p-6 flex items-center justify-center gap-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <AnimatePresence mode="wait">
                        {(step === 'front' || step === 'back') && (
                            <motion.button 
                                key="btn"
                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                onClick={takePhoto}
                                className="w-24 h-24 rounded-full border-4 border-[#4BFF94] p-1.5 active:scale-90 transition-all shadow-[0_0_40px_rgba(75,255,148,0.2)]"
                            >
                                <div className="w-full h-full bg-[#4BFF94] rounded-full flex items-center justify-center">
                                    <Camera size={36} className="text-[#0a0a0a]" strokeWidth={2.5} />
                                </div>
                            </motion.button>
                        )}
                        {step === 'analyzing' && (
                             <div className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Processing...</div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
