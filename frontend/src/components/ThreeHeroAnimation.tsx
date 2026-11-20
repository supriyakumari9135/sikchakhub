import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroAnimation: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4);
    scene.add(ambientLight);

    // Warm Key Light (Orange/Gold tint)
    const keyLight = new THREE.DirectionalLight(0xffa142, 2.8);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    // Cool Fill Light (Soft Sky Blue)
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 1.2);
    fillLight.position.set(-5, 3, 3);
    scene.add(fillLight);

    // Warm Rim Light from Behind
    const rimLight = new THREE.DirectionalLight(0xffd8a8, 2.0);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Central Main Pivot Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // =========================================================================
    // A. 3D GRADUATION CAP (Mortarboard)
    // =========================================================================
    const capGroup = new THREE.Group();
    capGroup.position.set(-0.3, 1.1, 0);

    // Cap Top Board (Diamond Mortarboard)
    const boardGeo = new THREE.BoxGeometry(1.6, 0.08, 1.6);
    const darkCapMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.1,
    });
    const capBoard = new THREE.Mesh(boardGeo, darkCapMat);
    capBoard.rotation.y = Math.PI / 4;
    capGroup.add(capBoard);

    // Skull cap base (curved hemisphere beneath board)
    const skullGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.4, 24);
    const skullCap = new THREE.Mesh(skullGeo, darkCapMat);
    skullCap.position.y = -0.22;
    capGroup.add(skullCap);

    // Center Golden Button
    const buttonGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85,
    });
    const button = new THREE.Mesh(buttonGeo, goldMat);
    button.position.y = 0.06;
    capGroup.add(button);

    // Golden Tassel Ribbon
    const tasselCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.06, 0),
      new THREE.Vector3(0.4, 0.05, 0.4),
      new THREE.Vector3(0.75, -0.1, 0.75),
      new THREE.Vector3(0.85, -0.45, 0.85),
    ]);
    const tasselRibbonGeo = new THREE.TubeGeometry(tasselCurve, 16, 0.02, 8, false);
    const tasselRibbon = new THREE.Mesh(tasselRibbonGeo, goldMat);
    capGroup.add(tasselRibbon);

    // Tassel End Fringe
    const tasselEndGeo = new THREE.ConeGeometry(0.07, 0.22, 12);
    const tasselEnd = new THREE.Mesh(tasselEndGeo, goldMat);
    tasselEnd.position.set(0.85, -0.55, 0.85);
    tasselEnd.rotation.x = Math.PI;
    capGroup.add(tasselEnd);

    mainGroup.add(capGroup);

    // =========================================================================
    // B. 3D ROBOT ASSISTANT HEAD
    // =========================================================================
    const botGroup = new THREE.Group();
    botGroup.position.set(1.1, 0.4, 0.5);

    // Robot Head Sphere
    const botHeadGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const botMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1,
    });
    const botHead = new THREE.Mesh(botHeadGeo, botMat);
    botGroup.add(botHead);

    // Glowing Eye Visor
    const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 24, 1, false, 0, Math.PI);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.5,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = Math.PI / 2;
    visor.rotation.z = Math.PI / 2;
    visor.position.set(0, 0.05, 0.36);
    botGroup.add(visor);

    // Cyan LED Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eyeGeo = new THREE.CapsuleGeometry(0.04, 0.07, 8, 8);
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 0.05, 0.48);
    leftEye.rotation.z = Math.PI / 2;
    botGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 0.05, 0.48);
    rightEye.rotation.z = Math.PI / 2;
    botGroup.add(rightEye);

    // Headphone Ear Cups (Left & Right)
    const earCupGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 20);
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.25,
      metalness: 0.4,
    });
    const leftEar = new THREE.Mesh(earCupGeo, orangeMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.5, 0.05, 0);
    botGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earCupGeo, orangeMat);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(0.5, 0.05, 0);
    botGroup.add(rightEar);

    // Headphone Band Arch
    const bandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, 0.05, 0),
      new THREE.Vector3(-0.35, 0.6, 0),
      new THREE.Vector3(0, 0.68, 0),
      new THREE.Vector3(0.35, 0.6, 0),
      new THREE.Vector3(0.5, 0.05, 0),
    ]);
    const bandGeo = new THREE.TubeGeometry(bandCurve, 20, 0.035, 8, false);
    const bandMesh = new THREE.Mesh(bandGeo, darkCapMat);
    botGroup.add(bandMesh);

    mainGroup.add(botGroup);

    // =========================================================================
    // C. 3D STACKED ACADEMIC BOOKS
    // =========================================================================
    const booksGroup = new THREE.Group();
    booksGroup.position.set(-0.2, -0.6, 0);

    const createBook = (colorHex: number, yPos: number, rotY: number, scale: number = 1) => {
      const bGroup = new THREE.Group();
      bGroup.position.y = yPos;
      bGroup.rotation.y = rotY;

      // Cover
      const coverGeo = new THREE.BoxGeometry(1.6 * scale, 0.18 * scale, 1.2 * scale);
      const coverMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.4,
        metalness: 0.1,
      });
      const cover = new THREE.Mesh(coverGeo, coverMat);
      bGroup.add(cover);

      // White Pages insert
      const pagesGeo = new THREE.BoxGeometry(1.52 * scale, 0.14 * scale, 1.12 * scale);
      const pagesMat = new THREE.MeshStandardMaterial({
        color: 0xfffbf0,
        roughness: 0.8,
      });
      const pages = new THREE.Mesh(pagesGeo, pagesMat);
      pages.position.set(0.04 * scale, 0, 0);
      bGroup.add(pages);

      return bGroup;
    };

    // Bottom Book (Warm Orange)
    const book1 = createBook(0xff6600, -0.25, -0.15, 1.1);
    booksGroup.add(book1);

    // Middle Book (Royal Indigo)
    const book2 = createBook(0x6366f1, 0, 0.1, 1.0);
    booksGroup.add(book2);

    // Top Book (Teal / Emerald)
    const book3 = createBook(0x10b981, 0.23, -0.05, 0.9);
    booksGroup.add(book3);

    mainGroup.add(booksGroup);

    // =========================================================================
    // D. GLOWING GOLDEN ORBITAL RINGS
    // =========================================================================
    const ringGeo = new THREE.TorusGeometry(1.9, 0.03, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.9,
    });
    const orbitRing1 = new THREE.Mesh(ringGeo, ringMat);
    orbitRing1.rotation.x = Math.PI / 3;
    orbitRing1.rotation.y = Math.PI / 6;
    mainGroup.add(orbitRing1);

    const orbitRing2 = new THREE.Mesh(ringGeo, ringMat);
    orbitRing2.rotation.x = -Math.PI / 3.5;
    orbitRing2.rotation.y = -Math.PI / 5;
    orbitRing2.scale.set(1.15, 1.15, 1.15);
    mainGroup.add(orbitRing2);

    // =========================================================================
    // E. FLOATING 3D STARS & SPARKLES
    // =========================================================================
    const starsGroup = new THREE.Group();
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xffd166,
      emissiveIntensity: 0.6,
      metalness: 0.8,
    });

    const starData: { mesh: THREE.Mesh; initialY: number; speed: number; rotSpeed: number }[] = [];
    for (let i = 0; i < 24; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      const angle = (i / 24) * Math.PI * 2;
      const radius = 1.8 + (Math.random() - 0.5) * 1.2;
      star.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.8,
        Math.sin(angle) * radius * 0.7
      );
      const scale = 0.5 + Math.random() * 0.7;
      star.scale.set(scale, scale, scale);
      starsGroup.add(star);

      starData.push({
        mesh: star,
        initialY: star.position.y,
        speed: 0.5 + Math.random() * 1.5,
        rotSpeed: 0.02 + Math.random() * 0.04,
      });
    }
    mainGroup.add(starsGroup);

    // =========================================================================
    // F. INTERACTIVE MOUSE PARALLAX & ANIMATION LOOP
    // =========================================================================
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
      mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      // Floating gentle bobbing
      capGroup.position.y = 1.1 + Math.sin(elapsedTime * 1.8) * 0.08;
      capGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.1;

      botGroup.position.y = 0.4 + Math.sin(elapsedTime * 2.2 + 1) * 0.12;
      botGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.08;

      booksGroup.position.y = -0.6 + Math.sin(elapsedTime * 1.4) * 0.04;

      // Rotate orbital rings
      orbitRing1.rotation.z = elapsedTime * 0.3;
      orbitRing2.rotation.z = -elapsedTime * 0.25;

      // Animate floating stars
      starData.forEach((sd) => {
        sd.mesh.position.y = sd.initialY + Math.sin(elapsedTime * sd.speed) * 0.15;
        sd.mesh.rotation.x += sd.rotSpeed;
        sd.mesh.rotation.y += sd.rotSpeed;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 450;
      const newHeight = container.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] flex items-center justify-center pointer-events-none select-none">
      <div ref={mountRef} className="w-full h-full pointer-events-auto" />
    </div>
  );
};
