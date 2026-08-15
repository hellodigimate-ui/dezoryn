import * as THREE from 'three';

/**
 * Creates a photorealistic high-definition 2K Earth Surface Canvas Texture:
 * Vibrant sapphire blue oceans, lush green forests, golden deserts,
 * arctic polar ice caps, shallow turquoise coastal shelves, and city lights.
 */
export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Rich Sapphire & Royal Blue Ocean Base Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0a1d37');   // Polar Deep Blue
  oceanGrad.addColorStop(0.2, '#0f3260');
  oceanGrad.addColorStop(0.5, '#1e40af');  // Equatorial Sapphire Blue
  oceanGrad.addColorStop(0.8, '#0f3260');
  oceanGrad.addColorStop(1, '#0a1d37');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const toCanvas = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    return [x, y];
  };

  // Helper to draw realistic landmasses with turquoise coastal shelves & biome gradients
  const drawLandmass = (coords: Array<[number, number]>, landColor: string, desertColor?: string) => {
    if (coords.length === 0) return;

    // Shallow Turquoise Coastal Shelf Glow
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 4.5;

    ctx.beginPath();
    const [startX, startY] = toCanvas(coords[0][0], coords[0][1]);
    ctx.moveTo(startX, startY);
    for (let i = 1; i < coords.length; i++) {
      const [x, y] = toCanvas(coords[i][0], coords[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Continent Land Fill
    ctx.shadowBlur = 0;
    ctx.fillStyle = landColor;
    ctx.fill();

    // Desert Biome Accent
    if (desertColor) {
      ctx.fillStyle = desertColor;
      ctx.fill();
    }
  };

  // North America (Forest Green & Tundra)
  drawLandmass([
    [-168, 68], [-140, 72], [-115, 75], [-75, 74], [-60, 60],
    [-55, 48], [-64, 44], [-75, 35], [-80, 25], [-90, 15],
    [-105, 20], [-118, 32], [-125, 48], [-145, 60], [-168, 62]
  ], '#2d6a4f', 'rgba(233, 196, 106, 0.2)');

  // South America (Amazon Rainforest Emerald)
  drawLandmass([
    [-80, 12], [-60, 12], [-36, -5], [-35, -20], [-50, -32],
    [-68, -55], [-75, -45], [-80, -2]
  ], '#1b4332');

  // Europe & Asia (Rich Forest & Siberian Steppe)
  drawLandmass([
    [-10, 36], [10, 44], [25, 60], [60, 70], [100, 75],
    [140, 72], [170, 65], [170, 50], [140, 40], [100, 35],
    [65, 38], [40, 42], [28, 41], [0, 43], [-10, 38]
  ], '#2d6a4f');

  // Africa (Tropical Forest & Sahara Gold Desert)
  drawLandmass([
    [-17, 35], [10, 37], [32, 31], [43, 12], [51, 10],
    [40, -35], [18, -35], [12, -5], [-17, 15]
  ], '#386641', 'rgba(233, 196, 106, 0.45)');

  // Australia (Outback Gold & Emerald Coast)
  drawLandmass([
    [113, -14], [138, -12], [153, -25], [150, -38], [116, -35]
  ], '#40916c', 'rgba(230, 140, 50, 0.35)');

  // Polar Ice Caps (Pure White Crisp Ice Borders)
  ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.075);
  ctx.fillRect(0, canvas.height * 0.905, canvas.width, canvas.height * 0.095);

  // Glowing Metropolis Night City Lights
  const cityLights: Array<[number, number]> = [
    [-122, 37], [-118, 34], [-74, 40], [-87, 41], [-0.1, 51.5],
    [2.3, 48.8], [13.4, 52.5], [77.2, 28.6], [72.8, 19.0], [139.7, 35.6],
    [121.5, 31.2], [151.2, -33.8], [-43.1, -22.9], [55.3, 25.2]
  ];

  cityLights.forEach(([lon, lat]) => {
    const [x, y] = toCanvas(lon, lat);
    const lightGrad = ctx.createRadialGradient(x, y, 1, x, y, 7);
    lightGrad.addColorStop(0, '#ffffff');
    lightGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.85)');
    lightGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates Specular Reflection Map: White oceans reflect sun highlights
 */
export function createEarthSpecularMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates Realistic Cloud Swirl Texture Map
 */
export function createCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  for (let i = 0; i < 130; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = 45 + Math.random() * 120;
    const ry = 14 + Math.random() * 40;

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
