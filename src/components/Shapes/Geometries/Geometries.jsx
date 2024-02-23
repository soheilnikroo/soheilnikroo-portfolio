'use client';

import { Geometry } from '@/components/Shapes/Geometry';
import { GEOMETRIES, MATERIALS } from './Geometries.constants';

function Geometries() {
  return GEOMETRIES.map(({ position, r, geometry }) => (
    <Geometry
      key={JSON.stringify(position)}
      geometry={geometry}
      materials={MATERIALS}
      position={position.map((p) => p * 2)}
      r={r}
    />
  ));
}

export default Geometries;
