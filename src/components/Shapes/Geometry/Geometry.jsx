'use client';

import { useEffect, useRef, useState } from 'react';
import { Float } from '@react-three/drei';
import { gsap } from 'gsap';

function Geometry({ r, position, geometry, materials }) {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);

  function getRandomMaterial() {
    return gsap.utils.random(materials);
  }

  const startingMaterial = getRandomMaterial();

  function handleClick(e) {
    const mesh = e.object;

    gsap.to(mesh.rotation, {
      x: `+=${gsap.utils.random(0, 2)}`,
      y: `+=${gsap.utils.random(0, 2)}`,
      z: `+=${gsap.utils.random(0, 2)}`,
      duration: 1.3,
      ease: 'elastic.out(1,0.3)',
      yoyo: true,
    });

    mesh.material = getRandomMaterial();
  }

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      setVisible(true);
      gsap.from(meshRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: gsap.utils.random(0.8, 1.2),
        ease: 'elastic.out(1,0.3)',
        delay: gsap.utils.random(0, 0.5),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <group ref={meshRef} position={position}>
      <Float floatIntensity={5 * r} rotationIntensity={6 * r} speed={5 * r}>
        <mesh
          geometry={geometry}
          material={startingMaterial}
          visible={visible}
          onClick={handleClick}
          onPointerOut={handlePointerOut}
          onPointerOver={handlePointerOver}
        />
      </Float>
    </group>
  );
}

export default Geometry;
