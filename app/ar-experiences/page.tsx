'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, Leaf, Info, X } from 'lucide-react';

const PLANTS = [
  {
    id: 1,
    name: 'Neem Tree',
    scientific: 'Azadirachta indica',
    benefits: ['Purifies air', 'Reduces CO₂', 'Natural pesticide'],
    direction: 'Walk 20m straight ahead',
    emoji: '🌿',
    color: '#34d399',
    x: '20%', y: '30%',
  },
  {
    id: 2,
    name: 'Ashoka Tree',
    scientific: 'Saraca asoca',
    benefits: ['Reduces noise pollution', 'Provides shade', 'Supports biodiversity'],
    direction: 'Turn right, 15m ahead',
    emoji: '🌳',
    color: '#60a5fa',
    x: '65%', y: '25%',
  },
  {
    id: 3,
    name: 'Bougainvillea',
    scientific: 'Bougainvillea spectabilis',
    benefits: ['Attracts pollinators', 'Erosion control', 'Air purification'],
    direction: 'Turn left at the bench',
    emoji: '🌸',
    color: '#f472b6',
    x: '45%', y: '55%',
  },
];

export default function ARExperience() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [selected, setSelected] = useState<typeof PLANTS[0] | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setScanning(true);
        setTimeout(() => setScanning(false), 2000);
      }
    } catch {
      setCameraError('Camera access denied. Enable camera to use AR.');
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay when no camera */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <span className="text-5xl">📷</span>
          <p className="text-white text-sm font-medium">
            {cameraError || 'Starting camera…'}
          </p>
          {cameraError && (
            <button onClick={startCamera}
              className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
              style={{ background: '#34d399' }}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Scanning animation */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-green-400 opacity-30 animate-pulse rounded-none" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 opacity-60"
            style={{ animation: 'scan 2s linear' }} />
          <p className="absolute bottom-32 left-0 right-0 text-center text-green-400 text-sm font-semibold tracking-widest">
            SCANNING ENVIRONMENT…
          </p>
        </div>
      )}

      {/* AR Plant Pins */}
      {cameraActive && !scanning && PLANTS.map((plant) => (
        <button
          key={plant.id}
          onClick={() => setSelected(plant)}
          className="absolute flex flex-col items-center gap-1 transition-transform hover:scale-110"
          style={{ left: plant.x, top: plant.y, transform: 'translate(-50%, -50%)' }}>
          {/* Pulsing ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ background: plant.color, width: 40, height: 40, margin: -4 }} />
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg"
              style={{ background: plant.color, boxShadow: `0 0 12px ${plant.color}80` }}>
              {plant.emoji}
            </div>
          </div>
          <span className="text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            {plant.name}
          </span>
        </button>
      ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }} />
          <span className="text-white text-xs font-semibold">AR Live · Lodhi Garden</span>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(52,211,153,0.2)', backdropFilter: 'blur(8px)' }}>
          <Leaf className="w-4 h-4" style={{ color: '#34d399' }} />
        </div>
      </div>

      {/* Bottom hint */}
      {cameraActive && !scanning && !selected && (
        <div className="absolute bottom-8 left-4 right-4 text-center">
          <p className="text-white text-xs px-4 py-2 rounded-full inline-block"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
            👆 Tap a pin to learn about the plant
          </p>
        </div>
      )}

      {/* Plant Detail Panel */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5"
          style={{ background: 'rgba(10,15,20,0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${selected.color}20` }}>
              {selected.emoji}
            </div>
            <div>
              <p className="text-white font-bold text-base">{selected.name}</p>
              <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)' }}>{selected.scientific}</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5" style={{ color: selected.color }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: selected.color }}>
                Environmental Benefits
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.benefits.map((b) => (
                <span key={b} className="text-xs px-3 py-1 rounded-full"
                  style={{ background: `${selected.color}18`, color: selected.color, border: `1px solid ${selected.color}30` }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <Navigation className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Guided Direction
              </p>
              <p className="text-sm font-semibold text-white">{selected.direction}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%   { transform: translateY(-50vh); }
          100% { transform: translateY(50vh); }
        }
      `}</style>
    </div>
  );
}
