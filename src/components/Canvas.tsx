import { useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Receipt } from './Receipt';
import type { PhotoItem } from '../types';

type InteractionMode = 'move' | 'rotate' | 'resize';

interface DragState {
  isDragging: boolean;
  mode: InteractionMode;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
  startRotation: number;
  startScale: number;
  centerX: number;
  centerY: number;
  startDistance: number;
}

function getRotateCursor(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>`;
  return `url("data:image/svg+xml,${svg}") 10 10, grab`;
}

function getResizeCursor(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
  return `url("data:image/svg+xml,${svg}") 9 9, nwse-resize`;
}

function detectMode(e: React.MouseEvent, element: HTMLDivElement): InteractionMode {
  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cornerSize = 24;
  const edgeSize = 14;

  // 코너 체크 (크기 조절)
  const isTopLeft = x < cornerSize && y < cornerSize;
  const isTopRight = x > rect.width - cornerSize && y < cornerSize;
  const isBottomLeft = x < cornerSize && y > rect.height - cornerSize;
  const isBottomRight = x > rect.width - cornerSize && y > rect.height - cornerSize;

  if (isTopLeft || isTopRight || isBottomLeft || isBottomRight) {
    return 'resize';
  }

  // 가장자리 체크 (회전)
  if (x < edgeSize || x > rect.width - edgeSize || y < edgeSize || y > rect.height - edgeSize) {
    return 'rotate';
  }

  return 'move';
}

function getCursorForMode(mode: InteractionMode): string {
  switch (mode) {
    case 'resize': return getResizeCursor();
    case 'rotate': return getRotateCursor();
    default: return 'move';
  }
}

function PhotoElement({ photo, isSelected, scale }: { photo: PhotoItem; isSelected: boolean; scale: number }) {
  const { selectElement, updatePhotoTransform } = useAppStore();
  const elementRef = useRef<HTMLDivElement>(null);
  const [hoverMode, setHoverMode] = useState<InteractionMode>('move');
  const dragRef = useRef<DragState>({
    isDragging: false,
    mode: 'move',
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
    startRotation: 0,
    startScale: 1,
    centerX: 0,
    centerY: 0,
    startDistance: 0,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.isDragging) return;
    if (elementRef.current) {
      setHoverMode(detectMode(e, elementRef.current));
    }
  };

  const handleMouseLeave = () => {
    if (!dragRef.current.isDragging) {
      setHoverMode('move');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ type: 'photo', id: photo.id });

    const rect = elementRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mode = hoverMode;

    const distFromCenter = Math.sqrt(
      (e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2
    );

    dragRef.current = {
      isDragging: true,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: photo.transform.x,
      startElementY: photo.transform.y,
      startRotation: photo.transform.rotation,
      startScale: photo.transform.scale,
      centerX,
      centerY,
      startDistance: distFromCenter,
    };

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const { mode: m } = dragRef.current;

      if (m === 'rotate') {
        const currentAngle = Math.atan2(
          ev.clientY - dragRef.current.centerY,
          ev.clientX - dragRef.current.centerX
        );
        const delta = (currentAngle - startAngle) * (180 / Math.PI);
        updatePhotoTransform(photo.id, {
          rotation: Math.round(dragRef.current.startRotation + delta),
        });
      } else if (m === 'resize') {
        const currentDist = Math.sqrt(
          (ev.clientX - dragRef.current.centerX) ** 2 +
          (ev.clientY - dragRef.current.centerY) ** 2
        );
        const ratio = currentDist / dragRef.current.startDistance;
        const newScale = Math.max(0.1, Math.min(5, dragRef.current.startScale * ratio));
        updatePhotoTransform(photo.id, { scale: parseFloat(newScale.toFixed(2)) });
      } else {
        const dx = (ev.clientX - dragRef.current.startX) / scale;
        const dy = (ev.clientY - dragRef.current.startY) / scale;
        updatePhotoTransform(photo.id, {
          x: dragRef.current.startElementX + dx,
          y: dragRef.current.startElementY + dy,
        });
      }
    };

    const onUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const { x, y, scale: photoScale, rotation } = photo.transform;
  const { offsetX, offsetY, blur, spread, color, opacity } = photo.shadow;
  const shadowColor = color + Math.round(opacity * 255).toString(16).padStart(2, '0');

  return (
    <div
      ref={elementRef}
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${photoScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: getCursorForMode(hoverMode),
        border: `${photo.borderWidth}px solid ${photo.borderColor}`,
        boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}`,
        background: '#fff',
        padding: photo.borderWidth > 0 ? '4px' : '0',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={photo.src}
        alt=""
        draggable={false}
        style={{
          display: 'block',
          width: photo.width,
          height: photo.height,
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />
      {isSelected && <div className="selection-outline" />}
      {isSelected && <div className="resize-handle tl" />}
      {isSelected && <div className="resize-handle tr" />}
      {isSelected && <div className="resize-handle bl" />}
      {isSelected && <div className="resize-handle br" />}
    </div>
  );
}

function ReceiptElement({ isSelected, scale }: { isSelected: boolean; scale: number }) {
  const { receiptTransform, selectElement, updateReceiptTransform } = useAppStore();
  const elementRef = useRef<HTMLDivElement>(null);
  const [hoverMode, setHoverMode] = useState<InteractionMode>('move');
  const dragRef = useRef<DragState>({
    isDragging: false,
    mode: 'move',
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
    startRotation: 0,
    startScale: 1,
    centerX: 0,
    centerY: 0,
    startDistance: 0,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.isDragging) return;
    if (elementRef.current) {
      setHoverMode(detectMode(e, elementRef.current));
    }
  };

  const handleMouseLeave = () => {
    if (!dragRef.current.isDragging) {
      setHoverMode('move');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ type: 'receipt' });

    const rect = elementRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mode = hoverMode;

    const distFromCenter = Math.sqrt(
      (e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2
    );

    dragRef.current = {
      isDragging: true,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: receiptTransform.x,
      startElementY: receiptTransform.y,
      startRotation: receiptTransform.rotation,
      startScale: receiptTransform.scale,
      centerX,
      centerY,
      startDistance: distFromCenter,
    };

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const { mode: m } = dragRef.current;

      if (m === 'rotate') {
        const currentAngle = Math.atan2(
          ev.clientY - dragRef.current.centerY,
          ev.clientX - dragRef.current.centerX
        );
        const delta = (currentAngle - startAngle) * (180 / Math.PI);
        updateReceiptTransform({
          rotation: Math.round(dragRef.current.startRotation + delta),
        });
      } else if (m === 'resize') {
        const currentDist = Math.sqrt(
          (ev.clientX - dragRef.current.centerX) ** 2 +
          (ev.clientY - dragRef.current.centerY) ** 2
        );
        const ratio = currentDist / dragRef.current.startDistance;
        const newScale = Math.max(0.3, Math.min(5, dragRef.current.startScale * ratio));
        updateReceiptTransform({ scale: parseFloat(newScale.toFixed(2)) });
      } else {
        const dx = (ev.clientX - dragRef.current.startX) / scale;
        const dy = (ev.clientY - dragRef.current.startY) / scale;
        updateReceiptTransform({
          x: dragRef.current.startElementX + dx,
          y: dragRef.current.startElementY + dy,
        });
      }
    };

    const onUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const { x, y, scale: rScale, rotation, width } = receiptTransform;

  return (
    <div
      ref={elementRef}
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${rScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: getCursorForMode(hoverMode),
        width: width,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Receipt />
      {isSelected && <div className="selection-outline" />}
      {isSelected && <div className="resize-handle tl" />}
      {isSelected && <div className="resize-handle tr" />}
      {isSelected && <div className="resize-handle bl" />}
      {isSelected && <div className="resize-handle br" />}
    </div>
  );
}

export function Canvas() {
  const { canvas, photos, selectedElement, selectElement } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewScale, setViewScale] = useState(0.5);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = (rect.width - 40) / canvas.width;
      const scaleY = (rect.height - 40) / canvas.height;
      setViewScale(Math.min(scaleX, scaleY, 1));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvas.width, canvas.height]);

  const handleCanvasClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-viewport">
        <div
          className="canvas-frame"
          id="canvas-frame"
          style={{
            width: canvas.width,
            height: canvas.height,
            transform: `scale(${viewScale})`,
            transformOrigin: 'top left',
            background: canvas.background
              ? `url(${canvas.background}) center/cover no-repeat`
              : canvas.backgroundColor,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseDown={handleCanvasClick}
        >
          {photos.map((photo) => (
            <PhotoElement
              key={photo.id}
              photo={photo}
              isSelected={
                selectedElement?.type === 'photo' && selectedElement.id === photo.id
              }
              scale={viewScale}
            />
          ))}

          <ReceiptElement
            isSelected={selectedElement?.type === 'receipt'}
            scale={viewScale}
          />
        </div>
      </div>
      <div className="canvas-info">
        {canvas.width} × {canvas.height} | {Math.round(viewScale * 100)}%
      </div>
    </div>
  );
}
