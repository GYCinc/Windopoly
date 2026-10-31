'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SoundManager } from '@/lib/audio';
import { Volume2, X, Compass, RotateCw } from 'lucide-react';

interface Turbine3DViewerProps {
  onClose: () => void;
}

interface Hotspot {
  id: string;
  name: string;
  phonetic: string;
  definition: string;
  position: [number, number, number];
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'nacelle',
    name: 'Nacelle',
    phonetic: '[nuh-SEL]',
    definition: 'The aerodynamic casing atop the tower containing the gearbox, generator, and yaw drive motors.',
    position: [0, 4.2, 0.5],
  },
  {
    id: 'rotor',
    name: 'Rotor Blade',
    phonetic: '[ROH-tur blayd]',
    definition: 'Aerodynamic carbon-composite airfoil that captures kinetic energy from wind currents.',
    position: [0, 4.2, 2.5],
  },
  {
    id: 'tower',
    name: 'Tubular Steel Tower',
    phonetic: '[TOO-byuh-lur tow-er]',
    definition: 'High-strength conical steel cylinder supporting the 400-ton nacelle at 120 meters altitude.',
    position: [0, 1.5, 0],
  },
  {
    id: 'monopile',
    name: 'Subsea Monopile',
    phonetic: '[MON-oh-pyle]',
    definition: 'Massive heavy-gauge steel foundation driven 35 meters deep into the ocean bedrock.',
    position: [0, -2.5, 0],
  },
];

export function Turbine3DViewer({ onClose }: Turbine3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(HOTSPOTS[0]);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x10b981, 1.0);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // Build Low-Poly Elegant Turbine Model
    const turbineGroup = new THREE.Group();

    // 1. Foundation / Ocean Plane
    const oceanGeo = new THREE.CylinderGeometry(6, 6, 0.2, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.7,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.y = -1.5;
    turbineGroup.add(ocean);

    // 2. Monopile (Under water & above)
    const monopileGeo = new THREE.CylinderGeometry(0.5, 0.55, 3.5, 24);
    const monopileMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 }); // Yellow offshore transition piece
    const monopile = new THREE.Mesh(monopileGeo, monopileMat);
    monopile.position.y = -1;
    turbineGroup.add(monopile);

    // 3. Tower
    const towerGeo = new THREE.CylinderGeometry(0.35, 0.5, 4.5, 24);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.5, roughness: 0.4 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 2.0;
    turbineGroup.add(tower);

    // 4. Nacelle (On top)
    const nacelleGeo = new THREE.BoxGeometry(0.9, 0.7, 1.8);
    const nacelleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.3 });
    const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
    nacelle.position.set(0, 4.3, 0.2);
    turbineGroup.add(nacelle);

    // 5. Rotor Hub & 3 Blades
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(0, 4.3, 1.2);

    const hubGeo = new THREE.ConeGeometry(0.4, 0.6, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    rotorGroup.add(hub);

    // 3 Aerodynamic Blades
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const bladeGeo = new THREE.CylinderGeometry(0.04, 0.2, 4.2, 12);
      bladeGeo.translate(0, 2.1, 0); // pivot at base
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.2 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.z = angle;
      rotorGroup.add(blade);
    }
    turbineGroup.add(rotorGroup);
    scene.add(turbineGroup);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate rotor blades
      rotorGroup.rotation.z -= 0.04;

      // Rotate whole turbine slowly if auto-rotating
      if (isAutoRotating) {
        turbineGroup.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAutoRotating]);

  const handleSelectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    SoundManager.speak(`${hotspot.name}. ${hotspot.definition}`, 0.88);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-4 border-emerald-500/80 rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden text-white relative">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              3D
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Offshore Wind Turbine Explorer
              </span>
              <h2 className="text-lg font-black text-white">
                Interactive Component Anatomy
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">{isAutoRotating ? 'Pause' : 'Rotate'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Interactive Hotspot Selector Overlay */}
          <div className="absolute top-4 left-4 z-20 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Component Hotspots:
            </span>
            {HOTSPOTS.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => handleSelectHotspot(spot)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold block transition-all cursor-pointer ${
                  selectedHotspot.id === spot.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 ring-2 ring-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {spot.name}
              </button>
            ))}
          </div>

          {/* Selected Hotspot Explanation Card at Bottom */}
          <div className="absolute bottom-4 inset-x-4 z-20 max-w-xl mx-auto p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-black text-white">{selectedHotspot.name}</h3>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {selectedHotspot.phonetic}
                </span>
              </div>

              <button
                type="button"
                onClick={() => SoundManager.speak(`${selectedHotspot.name}. ${selectedHotspot.definition}`, 0.88)}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
                title="Listen pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {selectedHotspot.definition}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
