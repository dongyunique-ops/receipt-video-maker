import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { renderReceipt } from '../utils/receiptRenderer';

export function Receipt() {
  const receipt = useAppStore((state) => state.receipt);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 폰트 로딩 후 렌더링
    const render = () => {
      const canvas = renderReceipt(receipt);
      // 기존 캔버스 제거
      const existing = containerRef.current?.querySelector('canvas');
      if (existing) existing.remove();
      // 새 캔버스 삽입
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      containerRef.current?.appendChild(canvas);
    };

    // 폰트가 로드될 때까지 기다림
    if (document.fonts) {
      document.fonts.ready.then(render);
    } else {
      setTimeout(render, 500);
    }
  }, [receipt]);

  return <div ref={containerRef} className="receipt-canvas-container" />;
}
