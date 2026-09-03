import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useAkra } from '../../context/AkraContext';
import { AKRA_PALETTE, createStardustParticles } from './AkraSceneSystem';
import { Lock, Mail, ArrowRight, Sparkles, Heart, Shield, KeyRound, Eye, EyeOff } from 'lucide-react';

export const AkraLogin3D: React.FC = () => {
  const { login, relationship } = useAkra();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form State
  const [email, setEmail] = useState('ragul@akra.love');
  const [password, setPassword] = useState('mama123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isWarping, setIsWarping] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<'ragul' | 'akshya'>('ragul');

  // Quick switch profile pre-fill
  const handleSelectProfile = (profile: 'ragul' | 'akshya') => {
    setSelectedProfile(profile);
    setErrorMsg('');
    if (profile === 'ragul') {
      setEmail('ragul@akra.love');
      setPassword('mama123');
    } else {
      setEmail('akshya@akra.love');
      setPassword('akshu123');
    }
  };

  // 3D Scene Refs
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const logoGroupRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(AKRA_PALETTE.deepBrown, 0.045);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting: Warm romantic ambient & moving rim lights
    const ambientLight = new THREE.AmbientLight(0x402528, 1.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(AKRA_PALETTE.softPink, 4.5, 20);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);
    lightRef.current = pointLight;

    const backLight = new THREE.PointLight(AKRA_PALETTE.warmGold, 3, 15);
    backLight.position.set(-3, -2, -2);
    scene.add(backLight);

    // Dimensional 3D AKRA Logo Group
    const logoGroup = new THREE.Group();
    logoGroupRef.current = logoGroup;

    // Outer decorative faceted ring (Rose Gold)
    const ringGeo = new THREE.TorusGeometry(1.4, 0.05, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: AKRA_PALETTE.warmGold,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x3d1c24,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    logoGroup.add(ring);

    // Secondary subtle orbiting ring
    const ring2Geo = new THREE.TorusGeometry(1.65, 0.02, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: AKRA_PALETTE.softPink,
      metalness: 0.9,
      roughness: 0.3,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 4;
    logoGroup.add(ring2);

    // Dimensional "A" Monogram in Center
    // Build stylized structural 'A'
    const barMat = new THREE.MeshStandardMaterial({
      color: AKRA_PALETTE.cream,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x5a2d3c,
      emissiveIntensity: 0.4,
    });

    const leftLegGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.6, 16);
    const leftLeg = new THREE.Mesh(leftLegGeo, barMat);
    leftLeg.position.set(-0.35, 0, 0);
    leftLeg.rotation.z = -0.32;
    logoGroup.add(leftLeg);

    const rightLegGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.6, 16);
    const rightLeg = new THREE.Mesh(rightLegGeo, barMat);
    rightLeg.position.set(0.35, 0, 0);
    rightLeg.rotation.z = 0.32;
    logoGroup.add(rightLeg);

    const crossBarGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16);
    const crossBar = new THREE.Mesh(crossBarGeo, barMat);
    crossBar.position.set(0, -0.15, 0);
    crossBar.rotation.z = Math.PI / 2;
    logoGroup.add(crossBar);

    // Floating Glowing Heart at center of 'A'
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    const heartMat = new THREE.MeshStandardMaterial({
      color: AKRA_PALETTE.deepRose,
      emissive: 0x8a324b,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.2,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.scale.set(0.45, 0.45, 0.45);
    heartMesh.rotation.z = Math.PI; // flip right side up
    heartMesh.position.set(0, 0.2, 0.1);
    logoGroup.add(heartMesh);

    scene.add(logoGroup);

    // Floating Stardust Particles
    const particles = createStardustParticles(180, { x: 12, y: 10, z: 12 });
    scene.add(particles.points);

    // Parallax Mouse Handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Gentle floating & rotation of 3D logo
      if (logoGroup) {
        logoGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;
        logoGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.25 + mouseRef.current.x * 0.35;
        logoGroup.rotation.x = Math.cos(elapsedTime * 0.5) * 0.15 + mouseRef.current.y * 0.25;
        ring2.rotation.z = elapsedTime * 0.3;
      }

      // Orbiting light
      if (lightRef.current) {
        lightRef.current.position.x = Math.cos(elapsedTime * 0.8) * 3.5;
        lightRef.current.position.y = Math.sin(elapsedTime * 0.6) * 2.5;
        lightRef.current.position.z = Math.sin(elapsedTime * 0.8) * 2.5 + 2;
      }

      // Parallax camera offset
      camera.position.x = mouseRef.current.x * 0.4;
      camera.position.y = mouseRef.current.y * 0.3;
      camera.lookAt(0, 0, 0);

      // Update particle stardust
      particles.update(elapsedTime);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your special email and password.');
      return;
    }

    // Trigger Cinematic Fly-through Warp
    setIsWarping(true);

    setTimeout(() => {
      const success = login(email.trim(), password.trim());
      if (!success) {
        setIsWarping(false);
        setErrorMsg('Incorrect credentials. Please verify your private password.');
      }
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1C1412] text-[#FFF7F2] overflow-hidden flex flex-col justify-between selection:bg-[#F4C7D3] selection:text-[#241916]">
      {/* 3D WebGL Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-0"
      />

      {/* Cinematic Warp Zoom Overlay on Success */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-all duration-1000 ease-in-out ${
          isWarping ? 'opacity-100 bg-[#FFF7F2] scale-150' : 'opacity-0 scale-100'
        }`}
      />

      {/* Header Tagline */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6B4636]/80 backdrop-blur-md border border-[#F4C7D3]/40 flex items-center justify-center font-serif text-xl text-[#F4C7D3] shadow-lg">
            A
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-wider text-[#FFF7F2]">AKRA</h1>
            <p className="text-[11px] text-[#DCCCE8] tracking-widest font-sans uppercase">
              A little world for two
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#241916]/60 backdrop-blur-md border border-[#F4C7D3]/20 text-xs text-[#DCCCE8]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Puducherry ♡ Bangalore</span>
        </div>
      </header>

      {/* Center Floating Glass Panel */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            isWarping ? 'scale-90 opacity-0 blur-sm' : 'scale-100 opacity-100'
          }`}
        >
          {/* Glass Card Container */}
          <div className="relative rounded-[36px] bg-[#2A1D1A]/75 backdrop-blur-2xl border border-[#F4C7D3]/30 p-7 sm:p-9 shadow-2xl overflow-hidden">
            {/* Soft Ambient Corner Glows */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#F4C7D3]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#DCCCE8]/15 blur-3xl pointer-events-none" />

            {/* Profile Selection Chips */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#DCCCE8]/90 block mb-2">
                Select Your Presence
              </span>

              <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-[#1C1412]/60 border border-[#F4C7D3]/20">
                <button
                  type="button"
                  id="login-select-ragul"
                  onClick={() => handleSelectProfile('ragul')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    selectedProfile === 'ragul'
                      ? 'bg-[#6B4636] text-[#FFF7F2] shadow-md border border-[#F4C7D3]/40'
                      : 'text-[#DCCCE8] hover:text-[#FFF7F2] hover:bg-[#2A1D1A]/50'
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80"
                    alt="Ragul"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#F4C7D3]"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold leading-tight truncate">Ragul</p>
                    <p className="text-[10px] text-[#F4C7D3] leading-tight truncate">mama • Puducherry</p>
                  </div>
                </button>

                <button
                  type="button"
                  id="login-select-akshya"
                  onClick={() => handleSelectProfile('akshya')}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    selectedProfile === 'akshya'
                      ? 'bg-[#6B4636] text-[#FFF7F2] shadow-md border border-[#F4C7D3]/40'
                      : 'text-[#DCCCE8] hover:text-[#FFF7F2] hover:bg-[#2A1D1A]/50'
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80"
                    alt="Akshya"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#F4C7D3]"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold leading-tight truncate">Akshya</p>
                    <p className="text-[10px] text-[#F4C7D3] leading-tight truncate">akshu • Bangalore</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#DCCCE8] mb-1.5">
                  Private ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#DCCCE8]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. ragul@akra.love"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1C1412]/70 border border-[#F4C7D3]/25 text-xs text-[#FFF7F2] placeholder-[#DCCCE8]/40 focus:outline-none focus:border-[#F4C7D3] focus:ring-1 focus:ring-[#F4C7D3] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#DCCCE8]">
                    Personal Password
                  </label>
                  <span className="text-[10px] text-[#F4C7D3]/80 font-mono">
                    {selectedProfile === 'ragul' ? 'mama123' : 'akshu123'}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#DCCCE8]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#1C1412]/70 border border-[#F4C7D3]/25 text-xs text-[#FFF7F2] placeholder-[#DCCCE8]/40 focus:outline-none focus:border-[#F4C7D3] focus:ring-1 focus:ring-[#F4C7D3] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#DCCCE8]/60 hover:text-[#FFF7F2] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Cinematic Submit Button */}
              <button
                type="submit"
                id="login-enter-btn"
                disabled={isWarping}
                className="w-full mt-2 py-3.5 rounded-full bg-gradient-to-r from-[#6B4636] via-[#A85D76] to-[#6B4636] text-[#FFF7F2] font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer border border-[#F4C7D3]/40"
              >
                <span>{isWarping ? 'Entering AKRA World...' : 'Enter Our World'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Subtle Security Footnote */}
            <div className="mt-5 pt-4 border-t border-[#F4C7D3]/15 text-center">
              <p className="text-[11px] text-[#DCCCE8]/70 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F4C7D3]" />
                <span>Encrypted private space for Ragul & Akshya only</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Ambient Info */}
      <footer className="relative z-10 p-6 text-center text-xs text-[#DCCCE8]/50">
        <p>AKRA • "A little world for two" • 3D Cinematic Experience</p>
      </footer>
    </div>
  );
};
