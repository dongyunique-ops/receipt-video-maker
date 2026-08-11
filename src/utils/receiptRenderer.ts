import type { ReceiptData } from '../types';

const RECEIPT_WIDTH = 420;
const PADDING_X = 28;
const LINE_HEIGHT = 1.7;

// 감열지 종이색
const PAPER_COLOR = { r: 245, g: 242, b: 235 };
// 잉크색 (감열 인쇄 - 순수 검정이 아닌 약간 회색빛)
const INK_COLOR = '#1a1a1a';

interface DrawContext {
  ctx: CanvasRenderingContext2D;
  y: number;
  width: number;
}

function generatePaperTexture(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // 기본 종이색 채우기
  ctx.fillStyle = `rgb(${PAPER_COLOR.r}, ${PAPER_COLOR.g}, ${PAPER_COLOR.b})`;
  ctx.fillRect(0, 0, width, height);

  // 노이즈 패턴 생성 (실제 감열지 질감)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // 랜덤 노이즈 (미세한 종이 결)
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 2)); // B (약간 노랗게)
  }

  // 세로 줄 패턴 (감열지 특유의 세로 결)
  for (let x = 0; x < width; x++) {
    if (Math.random() < 0.03) {
      const opacity = Math.random() * 3;
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        data[idx] -= opacity;
        data[idx + 1] -= opacity;
        data[idx + 2] -= opacity;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 약간의 그라데이션 오버레이 (가장자리가 살짝 어둡게)
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.02)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight: string = '700') {
  // POS 영수증의 실제 폰트에 가장 가까운 조합
  ctx.font = `${weight} ${size}px 'Black Han Sans', 'Noto Sans KR', sans-serif`;
  ctx.fillStyle = INK_COLOR;
}

function drawText(dc: DrawContext, text: string, fontSize: number, options?: {
  weight?: string;
  align?: CanvasTextAlign;
  letterSpacing?: number;
  color?: string;
}) {
  const { ctx, width } = dc;
  const weight = options?.weight ?? '700';
  const align = options?.align ?? 'left';
  const color = options?.color ?? INK_COLOR;

  setFont(ctx, fontSize, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;

  let x = PADDING_X;
  if (align === 'center') x = width / 2;
  else if (align === 'right') x = width - PADDING_X;

  // 글자간격 처리
  if (options?.letterSpacing && options.letterSpacing > 0) {
    ctx.textAlign = 'left';
    const startX = align === 'center'
      ? (width - text.length * (fontSize + options.letterSpacing)) / 2
      : PADDING_X;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], startX + i * (fontSize * 0.6 + options.letterSpacing), dc.y);
    }
  } else {
    ctx.fillText(text, x, dc.y);
  }

  dc.y += fontSize * LINE_HEIGHT;
}

function drawWrappedText(dc: DrawContext, text: string, fontSize: number, weight: string = '700') {
  const { ctx, width } = dc;
  setFont(ctx, fontSize, weight);

  const maxWidth = width - PADDING_X * 2;
  const chars = text.split('');
  let line = '';

  for (const char of chars) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, PADDING_X, dc.y);
      dc.y += fontSize * LINE_HEIGHT;
      line = char;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, PADDING_X, dc.y);
    dc.y += fontSize * LINE_HEIGHT;
  }
}

function drawLine(dc: DrawContext, style: 'solid' | 'dashed' = 'solid') {
  const { ctx, width } = dc;
  dc.y += 6;
  ctx.beginPath();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;

  if (style === 'dashed') {
    ctx.setLineDash([6, 4]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.moveTo(PADDING_X, dc.y);
  ctx.lineTo(width - PADDING_X, dc.y);
  ctx.stroke();
  ctx.setLineDash([]);
  dc.y += 10;
}

function drawMenuRow(dc: DrawContext, name: string, qty: number | string, price: string, fontSize: number = 15) {
  const { ctx, width } = dc;
  setFont(ctx, fontSize, '700');

  // 이름 (왼쪽)
  ctx.textAlign = 'left';
  ctx.fillText(name, PADDING_X, dc.y);

  // 수량 (중앙-오른쪽)
  ctx.textAlign = 'right';
  ctx.fillText(String(qty), width - PADDING_X - 90, dc.y);

  // 금액 (오른쪽)
  ctx.fillText(price, width - PADDING_X, dc.y);

  dc.y += fontSize * LINE_HEIGHT;
}

function drawTotalRow(dc: DrawContext, label: string, amount: string) {
  const { ctx, width } = dc;
  setFont(ctx, 16, '700');

  ctx.textAlign = 'left';
  ctx.fillText(label, PADDING_X, dc.y);

  ctx.textAlign = 'right';
  ctx.fillText(amount, width - PADDING_X, dc.y);

  dc.y += 16 * LINE_HEIGHT;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function renderReceipt(data: ReceiptData): HTMLCanvasElement {
  // 먼저 높이를 계산하기 위해 가상으로 한번 그림
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = RECEIPT_WIDTH;
  tempCanvas.height = 2000; // 넉넉하게
  const tempCtx = tempCanvas.getContext('2d')!;

  const height = calculateHeight(tempCtx, data);

  // 실제 캔버스 생성
  const canvas = document.createElement('canvas');
  canvas.width = RECEIPT_WIDTH;
  canvas.height = height + 40; // 여유
  const ctx = canvas.getContext('2d')!;

  // 종이 질감 배경
  generatePaperTexture(ctx, canvas.width, canvas.height);

  // 약간의 blur로 감열 인쇄 느낌 (선명하지 않은 인쇄)
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 0.5;
  ctx.shadowOffsetX = 0.3;
  ctx.shadowOffsetY = 0.3;

  const dc: DrawContext = { ctx, y: 36, width: RECEIPT_WIDTH };

  // 제목
  drawText(dc, data.title, 18, { align: 'center', letterSpacing: 6 });
  dc.y += 8;

  // 배달주소
  drawText(dc, '배달주소:', 14, { weight: '700' });
  drawText(dc, data.deliveryAddress, 26, { weight: '900', letterSpacing: 4 });
  dc.y += 4;

  // 고객요청
  drawText(dc, '*************** 고객요청 ***************', 12, { align: 'center' });
  drawWrappedText(dc, data.customerRequest, 15, '700');

  // 라이더요청
  drawText(dc, '*************** 라이더요청 ***************', 12, { align: 'center' });
  drawText(dc, data.riderRequest, 15);
  dc.y += 4;

  // 메뉴 헤더
  drawLine(dc, 'solid');
  drawMenuRow(dc, '메뉴', '수량', '금액', 15);
  drawLine(dc, 'dashed');

  // 메뉴 아이템
  for (const item of data.menuItems) {
    if (item.isPromo && item.promoLabel) {
      if (item.name) {
        drawText(dc, item.name, 15);
      }
      drawMenuRow(dc, item.promoLabel, item.quantity, formatPrice(item.price), 14);
    } else {
      drawMenuRow(dc, item.name, item.quantity, formatPrice(item.price), 15);
    }
  }

  // 배달비
  drawMenuRow(dc, '배달비', 1, formatPrice(data.deliveryFee), 15);

  // 할인 라벨
  drawText(dc, data.discountLabel, 15);

  // 합계
  drawLine(dc, 'dashed');
  dc.y += 4;

  drawTotalRow(dc, '소계금액', formatPrice(data.subtotal));
  drawTotalRow(dc, '할인금액', formatPrice(data.discount));
  drawTotalRow(dc, '합계금액', formatPrice(data.total));
  drawTotalRow(dc, '청구금액', formatPrice(data.chargedAmount));

  // shadow 제거
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  return canvas;
}

function calculateHeight(ctx: CanvasRenderingContext2D, data: ReceiptData): number {
  let y = 36;
  const addLine = (size: number) => { y += size * LINE_HEIGHT; };

  // 제목
  addLine(18); y += 8;

  // 배달주소
  addLine(14);
  addLine(26); y += 4;

  // 고객요청
  addLine(12);
  // 줄바꿈 계산
  setFont(ctx, 15, '700');
  const maxWidth = RECEIPT_WIDTH - PADDING_X * 2;
  const chars = data.customerRequest.split('');
  let line = '';
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      addLine(15);
      line = char;
    } else {
      line = testLine;
    }
  }
  if (line) addLine(15);

  // 라이더요청
  addLine(12);
  addLine(15); y += 4;

  // 메뉴 헤더 + 구분선
  y += 16; // line
  addLine(15); // header
  y += 16; // dashed line

  // 메뉴 아이템
  for (const item of data.menuItems) {
    if (item.isPromo && item.promoLabel) {
      if (item.name) addLine(15);
      addLine(14);
    } else {
      addLine(15);
    }
  }

  // 배달비 + 할인라벨
  addLine(15);
  addLine(15);

  // 합계 구분선 + 항목
  y += 16;
  y += 4;
  addLine(16); addLine(16); addLine(16); addLine(16);

  return y + 20;
}

export function getReceiptDimensions(data: ReceiptData): { width: number; height: number } {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = RECEIPT_WIDTH;
  tempCanvas.height = 2000;
  const tempCtx = tempCanvas.getContext('2d')!;
  const height = calculateHeight(tempCtx, data);
  return { width: RECEIPT_WIDTH, height: height + 40 };
}
