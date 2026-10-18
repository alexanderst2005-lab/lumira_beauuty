'use client';

import React from 'react';
import { useChristmas } from '@/context/ChristmasContext';
import ChristmasCanvasEffects from './ChristmasCanvasEffects';
import ChristmasLights from './ChristmasLights';
import ChristmasExtraDecor from './ChristmasExtraDecor';

export default function ChristmasSeasonEffects() {
  const { activeConfig, isChristmasActive } = useChristmas();

  if (!isChristmasActive) {
    return null;
  }

  return (
    <div className="christmas-mode-wrapper pointer-events-none select-none">
      {/* 1. Nieve y Destellos en Canvas */}
      {(activeConfig.snow || activeConfig.sparkles) && (
        <ChristmasCanvasEffects
          showSnow={activeConfig.snow}
          showSparkles={activeConfig.sparkles}
        />
      )}

      {/* 2. Luces Navideñas en el encabezado superior */}
      {activeConfig.lights && <ChristmasLights />}

      {/* 3. Decoración adicional delicada */}
      {activeConfig.extraDecor && <ChristmasExtraDecor />}
    </div>
  );
}
