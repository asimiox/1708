import { Move } from '../types/game';

export interface SnapshotData {
  level?: number;
  mode: string;
  movesCount: number;
  bestPossible: number;
  history: Move[];
  isClassicFounderRoute?: boolean;
}

/**
 * Creates a high-resolution 1080x1080 image snapshot of victory with 1708 branding
 */
export async function createVictorySnapshot(data: SnapshotData): Promise<{ dataUrl: string; blob: Blob }> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Background: Deep luxury dark charcoal/black
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, 1080, 1080);

  // Outer border & ambient frame
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 1000, 1000);

  // Inner card background
  ctx.fillStyle = '#121215';
  roundRect(ctx, 60, 60, 960, 960, 28);
  ctx.fill();
  ctx.strokeStyle = '#1F1F23';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw 4 Isometric 3D Cubes of 1708
  draw3DCubesLogo(ctx, 540, 160);

  // Title: 1708
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 74px "Bodoni Moda", "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('1708', 540, 275);

  // Subtitle
  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 18px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('NUMBER PUZZLE · BY ASIM NAWAZ', 540, 310);
  ctx.letterSpacing = '0px';

  // Divider
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(380, 335);
  ctx.lineTo(700, 335);
  ctx.stroke();

  // Level Badge Pill
  const levelText = data.mode === 'level' && data.level
    ? `LEVEL ${data.level} COMPLETED`
    : `${data.mode.toUpperCase()} PUZZLE SOLVED`;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 360, 365, 360, 48, 24);
  ctx.fill();

  ctx.fillStyle = '#09090B';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(levelText, 540, 396);
  ctx.letterSpacing = '0px';

  // Stats Card
  ctx.fillStyle = '#18181B';
  roundRect(ctx, 120, 445, 840, 130, 20);
  ctx.fill();
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Column 1: Moves
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Bodoni Moda", Georgia, serif';
  ctx.fillText(`${data.movesCount}`, 260, 508);
  ctx.fillStyle = '#71717A';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MOVES TAKEN', 260, 542);

  // Divider 1
  ctx.strokeStyle = '#27272A';
  ctx.beginPath();
  ctx.moveTo(400, 465);
  ctx.lineTo(400, 555);
  ctx.stroke();

  // Column 2: Optimal
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Bodoni Moda", Georgia, serif';
  ctx.fillText(`${data.bestPossible}`, 540, 508);
  ctx.fillStyle = '#71717A';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OPTIMAL MOVES', 540, 542);

  // Divider 2
  ctx.strokeStyle = '#27272A';
  ctx.beginPath();
  ctx.moveTo(680, 465);
  ctx.lineTo(680, 555);
  ctx.stroke();

  // Column 3: Rating
  const isOptimal = data.movesCount <= data.bestPossible;
  ctx.fillStyle = isOptimal ? '#FFFFFF' : '#D4D4D8';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(isOptimal ? '★ PERFECT' : '✓ SOLVED', 820, 508);
  ctx.fillStyle = '#71717A';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ACCURACY', 820, 542);

  // Sequence Box
  ctx.fillStyle = '#161619';
  roundRect(ctx, 120, 605, 840, 280, 20);
  ctx.fill();
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SOLUTION SEQUENCE (${data.history.length} STEPS)`, 160, 645);

  // Draw steps
  const stepsToShow = data.history.slice(0, 5);
  stepsToShow.forEach((m, idx) => {
    const yPos = 690 + idx * 36;
    ctx.fillStyle = '#71717A';
    ctx.font = '500 18px monospace';
    ctx.fillText(`${idx + 1}.`, 160, yPos);

    let opExpr = '';
    if (m.op === 'SQ') opExpr = `${m.inputs[0]}²`;
    else if (m.op === 'POW') opExpr = `${m.inputs[0]}^${m.inputs[0]}`;
    else if (m.op === 'ADD') opExpr = `${m.inputs[0]} + ${m.inputs[1]}`;
    else if (m.op === 'SUB') opExpr = `|${m.inputs[0]} - ${m.inputs[1]}|`;
    else opExpr = `${m.inputs[0]} × ${m.inputs[1]}`;

    ctx.fillStyle = '#E4E4E7';
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(opExpr, 200, yPos);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`= ${m.result}`, 920, yPos);
    ctx.textAlign = 'left';
  });

  if (data.history.length > 5) {
    ctx.fillStyle = '#71717A';
    ctx.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`+ ${data.history.length - 5} more moves...`, 160, 868);
  }

  // Footer Branding & URL
  ctx.textAlign = 'center';
  ctx.fillStyle = '#71717A';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Target number 1708 reached · 1708game.vercel.app', 540, 940);

  ctx.fillStyle = '#52525B';
  ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Play now: Reach exactly 1708 using math operation tokens', 540, 972);

  // Return PNG Blob & Data URL
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        blob: blob || new Blob(),
      });
    }, 'image/png');
  });
}

/**
 * Draw 4 Isometric 3D Cubes of 1708 onto Canvas
 */
function draw3DCubesLogo(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  const digits = ['1', '7', '0', '8'];
  const cubeW = 42;
  const cubeH = 42;
  const depthX = 10;
  const depthY = 10;
  const gap = 12;

  const totalWidth = (cubeW + depthX + gap) * 4 - gap;
  const startX = centerX - totalWidth / 2;

  digits.forEach((digit, i) => {
    const x = startX + i * (cubeW + depthX + gap);
    const y = centerY;

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + cubeW / 2 + depthX / 2, y + cubeH + 8, cubeW * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top Face (Illuminated White)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + depthX, y - depthY);
    ctx.lineTo(x + cubeW + depthX, y - depthY);
    ctx.lineTo(x + cubeW, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Side Face (Soft Shaded Gray)
    ctx.fillStyle = '#D4D4D8';
    ctx.beginPath();
    ctx.moveTo(x + cubeW, y);
    ctx.lineTo(x + cubeW + depthX, y - depthY);
    ctx.lineTo(x + cubeW + depthX, y + cubeH - depthY);
    ctx.lineTo(x + cubeW, y + cubeH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#A1A1AA';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Front Face (White porcelain)
    ctx.fillStyle = '#FAFAFA';
    roundRect(ctx, x, y, cubeW, cubeH, 6);
    ctx.fill();
    ctx.strokeStyle = '#D4D4D8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Numeral (Crisp Black)
    ctx.fillStyle = '#09090B';
    ctx.font = 'bold 26px "Bodoni Moda", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(digit, x + cubeW / 2, y + cubeH / 2 + 9);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Triggers native share with image file or downloads snapshot
 */
export async function shareVictory(data: SnapshotData): Promise<'shared' | 'downloaded'> {
  const { blob, dataUrl } = await createVictorySnapshot(data);
  const fileName = `1708-${data.mode === 'level' ? `level-${data.level}` : data.mode}-solved.png`;
  const shareText = `I solved Level ${data.level || ''} in 1708 in ${data.movesCount} moves! Can you reach 1708? #1708Game`;

  const file = new File([blob], fileName, { type: 'image/png' });

  // Try Native Web Share API with image file
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: '1708 - Number Puzzle Victory',
        text: shareText,
        files: [file],
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'shared'; // user dismissed share sheet
      }
      // Fall through to download
    }
  }

  // Fallback: Direct Download
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Also copy text to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(
        `${shareText}\nPlay online: https://1708game.vercel.app`
      );
    } catch {
      // ignore clipboard error
    }
  }

  return 'downloaded';
}
