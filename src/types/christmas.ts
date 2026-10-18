export interface ChristmasConfig {
  enabled: boolean;          // Interruptor principal: Navidad activada / desactivada
  snow: boolean;             // Nieve animada (copos suaves blancos y rosa empolvado)
  lights: boolean;           // Luces navideñas (dorado champán y rosa cálido)
  sparkles: boolean;         // Destellos luminosos sutiles
  giftSection: boolean;      // Sección "Esta Navidad, regala belleza"
  extraDecor: boolean;       // Decoración adicional festiva (detalles delicados)
  updatedAt?: string;
}

export const DEFAULT_CHRISTMAS_CONFIG: ChristmasConfig = {
  enabled: false,
  snow: true,
  lights: true,
  sparkles: true,
  giftSection: true,
  extraDecor: true,
  updatedAt: new Date().toISOString()
};
