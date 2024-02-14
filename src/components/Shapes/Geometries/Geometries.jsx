'use client';

import { Geometry } from '../Geometry';
import { GEOMETRIES, MATERIALS } from './Geometries.constants';

function Geometries() {
  const SOUND_EFFECTS = [
    new Audio('/sounds/knock1.ogg'),
    new Audio('/sounds/knock2.ogg'),
    new Audio('/sounds/knock3.ogg'),
  ];

  return GEOMETRIES.map(({ position, r, geometry }) => (
    <Geometry
      key={JSON.stringify(position)}
      position={position.map((p) => p * 2)}
      geometry={geometry}
      soundEffects={SOUND_EFFECTS}
      materials={MATERIALS}
      r={r}
    />
  ));
}

export default Geometries;
