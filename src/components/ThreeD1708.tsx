import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeD1708Props {
  isWon?: boolean;
  className?: string;
}

export const ThreeD1708: React.FC<ThreeD1708Props> = ({ isWon = false, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlFailed, setWebGlFailed] = useState<boolean>(false);
  const isWonRef = useRef(isWon);

  useEffect(() => {
    isWonRef.current = isWon;
  }, [isWon]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 120;
    let height = container.clientHeight || 85;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch {
      setWebGlFailed(true);
      return;
    }

    // Scene & Orthographic/Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    // Isometric-like view
    camera.position.set(4.2, 4.0, 5.0);
    camera.lookAt(0, 0, 0);

    // Lighting: warm editorial sun + soft ambient fill + subtle rim light
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    sunLight.position.set(5, 8, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xc25e2e, 1.2);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Helpers to create numeral face textures
    const createDigitTexture = (
      digit: string,
      bgColor: string,
      textColor: string,
      borderColor: string
    ) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(8, 8, 240, 240, 28);
        ctx.fill();

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 10;
        ctx.stroke();

        // Inner soft bevel highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(14, 14, 228, 228, 22);
        ctx.stroke();

        // Serif Digit
        ctx.fillStyle = textColor;
        ctx.font = 'bold 148px "Bodoni Moda", "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(digit, 128, 138);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Soft drop shadow texture for ground contact
    const createShadowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 110);
        grad.addColorStop(0, 'rgba(30, 24, 19, 0.35)');
        grad.addColorStop(0.5, 'rgba(30, 24, 19, 0.15)');
        grad.addColorStop(1, 'rgba(30, 24, 19, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: createShadowTexture(),
      transparent: true,
      depthWrite: false,
    });
    const shadowGeo = new THREE.PlaneGeometry(5.2, 2.6);
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.75;
    scene.add(shadowMesh);

    // Root group for the 4 digits
    const digitsGroup = new THREE.Group();
    scene.add(digitsGroup);

    // Digits data: '1', '7', '0', '8'
    const digits = ['1', '7', '0', '8'];
    const digitMeshes: THREE.Mesh[] = [];
    const geometriesToDispose: THREE.BufferGeometry[] = [shadowGeo];
    const materialsToDispose: THREE.Material[] = [shadowMaterial];
    const texturesToDispose: THREE.Texture[] = [];

    // Distinct warm editorial tones for the 3D isometric blocks
    // Terracotta, Ivory, Bronze-Gold, Deep Clay
    const blockStyles = [
      { bg: '#B8562B', text: '#FFFDF9', side: '#8F3D17', top: '#D96E3E' }, // '1' terracotta
      { bg: '#FFFDF9', text: '#1E1813', side: '#D4C8B8', top: '#FFFFFF' }, // '7' warm ivory
      { bg: '#C97A3E', text: '#FFFDF9', side: '#9E5622', top: '#E2914F' }, // '0' warm amber
      { bg: '#2B231D', text: '#FFFDF9', side: '#1A1410', top: '#42372E' }, // '8' deep espresso
    ];

    const boxGeo = new THREE.BoxGeometry(0.86, 0.86, 0.86);
    geometriesToDispose.push(boxGeo);

    digits.forEach((char, i) => {
      const style = blockStyles[i];
      const digitTex = createDigitTexture(char, style.bg, style.text, style.side);
      texturesToDispose.push(digitTex);

      // Box materials: [right, left, top, bottom, front, back]
      const sideMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(style.side),
        roughness: 0.45,
        metalness: 0.1,
      });
      const topMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(style.top),
        roughness: 0.35,
        metalness: 0.05,
      });
      const frontMat = new THREE.MeshStandardMaterial({
        map: digitTex,
        roughness: 0.3,
        metalness: 0.1,
      });

      materialsToDispose.push(sideMat, topMat, frontMat);

      // Order of faces: +X, -X, +Y, -Y, +Z, -Z
      const materials = [sideMat, sideMat, topMat, sideMat, frontMat, sideMat];

      const mesh = new THREE.Mesh(boxGeo, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Position in an isometric step/curve
      const spacing = 0.98;
      const xPos = (i - 1.5) * spacing;
      const yPos = Math.sin((i / 3) * Math.PI) * 0.12;
      const zPos = -(i - 1.5) * 0.18;

      mesh.position.set(xPos, yPos, zPos);
      digitsGroup.add(mesh);
      digitMeshes.push(mesh);
    });

    // Isometric orientation angle for digitsGroup
    digitsGroup.rotation.y = -0.32;
    digitsGroup.rotation.x = 0.18;

    // Interactive pointer parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = -0.32;
    let targetRotX = 0.18;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx;
      mouseY = ny;
      targetRotY = -0.32 + mouseX * 0.35;
      targetRotX = 0.18 - mouseY * 0.25;
    };

    container.addEventListener('pointermove', handlePointerMove);

    // Animation loop
    let animId: number;
    let startTime = performance.now();
    let winSpin = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      // Subtle breathing floating motion
      const floatY = Math.sin(elapsed * 2.2) * 0.05;
      digitsGroup.position.y = floatY;

      // Smooth pointer interpolation
      digitsGroup.rotation.y += (targetRotY - digitsGroup.rotation.y) * 0.08;
      digitsGroup.rotation.x += (targetRotX - digitsGroup.rotation.x) * 0.08;

      // Individual staggered bounce
      digitMeshes.forEach((mesh, idx) => {
        mesh.position.y =
          Math.sin((idx / 3) * Math.PI) * 0.12 +
          Math.sin(elapsed * 2.8 + idx * 0.8) * 0.035;
      });

      // Win celebration spin
      if (isWonRef.current) {
        winSpin += 0.04;
        digitsGroup.rotation.y += Math.sin(winSpin) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 120;
      const nh = container.clientHeight || 85;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, []);

  if (webGlFailed) {
    // High-fidelity Isometric SVG Fallback
    return (
      <div
        className={`relative w-28 h-20 flex items-center justify-center select-none ${className}`}
        aria-label="3D 1708 Target"
      >
        <svg
          viewBox="0 0 160 110"
          className="w-full h-full drop-shadow-[0_6px_10px_rgba(30,24,19,0.18)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Isometric Shadow */}
          <ellipse cx="80" cy="98" rx="70" ry="10" fill="rgba(30,24,19,0.12)" />

          {/* Block '1' - Terracotta */}
          <g transform="translate(10, 24)">
            {/* Top Face */}
            <path d="M 16 0 L 32 8 L 16 16 L 0 8 Z" fill="#D96E3E" />
            {/* Left Face */}
            <path d="M 0 8 L 16 16 L 16 42 L 0 34 Z" fill="#B8562B" />
            {/* Right Face */}
            <path d="M 16 16 L 32 8 L 32 34 L 16 42 Z" fill="#8F3D17" />
            <text
              x="8"
              y="28"
              fill="#FFFDF9"
              fontFamily="Bodoni Moda, serif"
              fontSize="16"
              fontWeight="bold"
              transform="skewY(24)"
            >
              1
            </text>
          </g>

          {/* Block '7' - Warm Ivory */}
          <g transform="translate(44, 16)">
            <path d="M 16 0 L 32 8 L 16 16 L 0 8 Z" fill="#FFFFFF" />
            <path d="M 0 8 L 16 16 L 16 42 L 0 34 Z" fill="#FFFDF9" />
            <path d="M 16 16 L 32 8 L 32 34 L 16 42 Z" fill="#D4C8B8" />
            <text
              x="7"
              y="27"
              fill="#1E1813"
              fontFamily="Bodoni Moda, serif"
              fontSize="16"
              fontWeight="bold"
              transform="skewY(24)"
            >
              7
            </text>
          </g>

          {/* Block '0' - Warm Amber */}
          <g transform="translate(78, 16)">
            <path d="M 16 0 L 32 8 L 16 16 L 0 8 Z" fill="#E2914F" />
            <path d="M 0 8 L 16 16 L 16 42 L 0 34 Z" fill="#C97A3E" />
            <path d="M 16 16 L 32 8 L 32 34 L 16 42 Z" fill="#9E5622" />
            <text
              x="7"
              y="27"
              fill="#FFFDF9"
              fontFamily="Bodoni Moda, serif"
              fontSize="16"
              fontWeight="bold"
              transform="skewY(24)"
            >
              0
            </text>
          </g>

          {/* Block '8' - Deep Espresso */}
          <g transform="translate(112, 24)">
            <path d="M 16 0 L 32 8 L 16 16 L 0 8 Z" fill="#42372E" />
            <path d="M 0 8 L 16 16 L 16 42 L 0 34 Z" fill="#2B231D" />
            <path d="M 16 16 L 32 8 L 32 34 L 16 42 Z" fill="#1A1410" />
            <text
              x="7"
              y="28"
              fill="#FFFDF9"
              fontFamily="Bodoni Moda, serif"
              fontSize="16"
              fontWeight="bold"
              transform="skewY(24)"
            >
              8
            </text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-[130px] h-[88px] flex items-center justify-center select-none cursor-pointer overflow-visible transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] ${className}`}
      title="3D 1708 Target"
      aria-label="3D 1708 target isometric block"
    />
  );
};
