import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { AKRA_PALETTE, createEarthTexture } from './AkraSceneSystem';

interface Globe3DProps {
  userLocationName: string;
  partnerLocationName: string;
  distanceKm: number;
  isPartnerSharing: boolean;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  userLocationName,
  partnerLocationName,
  distanceKm,
  isPartnerSharing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 600;
    const height = 360;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5f8, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ea, 2.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const backLight = new THREE.PointLight(AKRA_PALETTE.softPink, 2.5, 10);
    backLight.position.set(-4, -2, -3);
    scene.add(backLight);

    // Globe Group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.28; // Earth axial tilt
    globeGroup.rotation.y = 1.35; // Orient towards India
    scene.add(globeGroup);

    // Earth Sphere
    const radius = 1.6;
    const earthGeo = new THREE.SphereGeometry(radius, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.6,
      metalness: 0.15,
      emissive: 0x1d1320,
      emissiveIntensity: 0.25,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Atmosphere Halo Rim
    const haloGeo = new THREE.SphereGeometry(radius * 1.05, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: AKRA_PALETTE.softPink,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(halo);

    // Convert Lat / Lon to 3D Cartesian coordinates
    const latLongToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Coordinates:
    // Puducherry: 11.9416 N, 79.8083 E
    // Bangalore: 12.9716 N, 77.5946 E
    const p1 = latLongToVector3(11.9416, 79.8083, radius * 1.01);
    const p2 = latLongToVector3(12.9716, 77.5946, radius * 1.01);

    // Marker 1: Puducherry (Ragul)
    const markerGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const markerMat1 = new THREE.MeshBasicMaterial({ color: 0xF4C7D3 });
    const marker1 = new THREE.Mesh(markerGeo, markerMat1);
    marker1.position.copy(p1);
    globeGroup.add(marker1);

    // Marker 2: Bangalore (Akshya)
    const markerMat2 = new THREE.MeshBasicMaterial({
      color: isPartnerSharing ? 0xFFD700 : 0x888888,
    });
    const marker2 = new THREE.Mesh(markerGeo, markerMat2);
    marker2.position.copy(p2);
    globeGroup.add(marker2);

    // Connecting Arc Line
    // Create quadratic curve rising above surface
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    midPoint.normalize().multiplyScalar(radius * 1.25); // arch above Earth

    const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
    const curvePoints = curve.getPoints(32);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({
      color: AKRA_PALETTE.glowPink,
      transparent: true,
      opacity: isPartnerSharing ? 0.85 : 0.25,
      linewidth: 2,
    });
    const arcLine = new THREE.Line(curveGeo, curveMat);
    globeGroup.add(arcLine);

    // Traveling Love Pulse Dot along the Arc
    const pulseGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xFFF7F2 });
    const pulseDot = new THREE.Mesh(pulseGeo, pulseMat);
    globeGroup.add(pulseDot);

    // Mouse drag interaction to inspect globe
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.004;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow gentle auto-rotation when idle
      if (!isDragging) {
        globeGroup.rotation.y += 0.0018;
      }

      // Pulse traveling along arc
      if (isPartnerSharing) {
        const t = (Math.sin(time * 2.2) + 1) / 2;
        const pos = curve.getPoint(t);
        pulseDot.position.copy(pos);
        pulseDot.visible = true;
      } else {
        pulseDot.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isPartnerSharing]);

  return (
    <div className="relative w-full rounded-3xl bg-[#241916]/90 border border-[#F4C7D3]/40 p-4 shadow-xl overflow-hidden text-[#FFF7F2]">
      {/* 3D Canvas */}
      <div className="relative w-full h-[360px] flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1C1412]/80 backdrop-blur-md border border-[#F4C7D3]/30 text-[11px] text-[#DCCCE8] flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive 3D Earth • Drag to Rotate</span>
        </div>

        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-2xl bg-[#1C1412]/85 backdrop-blur-md border border-[#F4C7D3]/30 text-xs text-right pointer-events-none">
          <p className="font-bold text-[#F4C7D3]">{distanceKm} km apart</p>
          <p className="text-[10px] text-[#DCCCE8]">Puducherry ⇄ Bangalore</p>
        </div>
      </div>
    </div>
  );
};
