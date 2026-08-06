'use client';

export default function MarqueeBanner() {
  const brands = [
    { emoji: '🌸', name: 'BLOOMSHELL' },
    { emoji: '✨', name: 'ANIK' },
    { emoji: '💖', name: 'BIOAQUA' },
    { emoji: '🌷', name: 'TRENDY' },
    { emoji: '💕', name: 'PURPURE' },
  ];

  // Double the brands for seamless loop
  const allBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="bg-secondary-100 py-2 marquee-container">
      <div className="marquee-content">
        {allBrands.map((brand, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 mx-8 text-sm font-medium text-primary-dark tracking-wider"
          >
            <span className="text-base">{brand.emoji}</span>
            <span className="font-heading font-semibold">{brand.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
