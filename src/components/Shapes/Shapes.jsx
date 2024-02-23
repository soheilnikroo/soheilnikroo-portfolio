'use client';

import { Suspense } from 'react';
import { ContactShadows, Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Geometries } from './Geometries';

export function Shapes() {
  return (
    <div className='row-span-1 row-start-1 -mt-9 aspect-square  md:col-span-1 md:col-start-2 md:mt-0'>
      <Canvas
        camera={{ position: [0, 0, 25], fov: 30, near: 1, far: 40 }}
        className='z-0'
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
        shadows
      >
        <Suspense fallback={null}>
          <Geometries />
          <ContactShadows
            blur={1}
            far={9}
            opacity={0.65}
            position={[0, -3.5, 0]}
            scale={40}
          />
          <Environment preset='sunset' />
        </Suspense>
      </Canvas>
    </div>
  );
}
