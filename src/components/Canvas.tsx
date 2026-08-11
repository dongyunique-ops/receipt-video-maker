import { useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Receipt } from './Receipt';
import type { PhotoItem } from '../types';

interface DragState {
  isDragging: boolean;
  mode: 'move' | 'rotate';
  elementType: 'photo' | 'receipt' | null;
  elementId: string | null;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
  startRotation: number;
  centerX: number;
  centerY: number;
}

function getRotateCursor(): string {
  // SVG rotate cursor
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>`;
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") 12 12, grab`;
}

function isNearEdge(e: React.MouseEvent, element: HTMLDivElement): boolean {
  const rect = element.getBoundingClientRect();
  const margin = 18; // 가장자리 감지 범위 (px)
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return (
    x < margin || x > rect.width - margin ||
    y < margin || y > rect.height - margin
  );
}

function PhotoElement({ photo, isSelected, scale }: { photo: PhotoItem; isSelected: boolean; scale: number }) {
  const { selectElement, updatePhotoTransform } = useAppStore();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRotateHover, setIsRotateHover] = useState(false);
  const dragRef = useRef<DragState>({
    isDragging: false,
    mode: 'move',
    elementType: null,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.isDragging) return;
    if (elementRef.current) {
      setIsRotateHover(isNearEdge(e, elementRef.current));
    }
  };

  const handleMouseLeave = () => {
    if (!dragRef.current.isDragging) {
      setIsRotateHover(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ type: 'photo', id: photo.id });

    const rect = elementRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mode = isRotateHover ? 'rotate' : 'move';

    dragRef.current = {
      isDragging: true,
      mode,
      elementType: 'photo',
      elementId: photo.id,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: photo.transform.x,
      startElementY: photo.transform.y,
      startRotation: photo.transform.rotation,
      centerX,
      centerY,
    };

    const startAngle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    );

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;

      if (dragRef.current.mode === 'rotate') {
        const currentAngle = Math.atan2(
          ev.clientY - dragRef.current.centerY,
          ev.clientX - dragRef.current.centerX
        );
        const delta = (currentAngle - startAngle) * (180 / Math.PI);
        updatePhotoTransform(photo.id, {
          rotation: Math.round(dragRef.current.startRotation + delta),
        });
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
      setIsRotateHover(false);
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
        cursor: isRotateHover ? getRotateCursor() : 'move',
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
      {isRotateHover && <div className="rotate-indicator" />}
    </div>
  );
}

function ReceiptElement({ isSelected, scale }: { isSelected: boolean; scale: number }) {
  const { receiptTransform, selectElement, updateReceiptTransform } = useAppStore();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRotateHover, setIsRotateHover] = useState(false);
  const dragRef = useRef<DragState>({
    isDragging: false,
    mode: 'move',
    elementType: null,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.isDragging) return;
    if (elementRef.current) {
      setIsRotateHover(isNearEdge(e, elementRef.current));
    }
  };

  const handleMouseLeave = () => {
    if (!dragRef.current.isDragging) {
      setIsRotateHover(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ type: 'receipt' });

    const rect = elementRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mode = isRotateHover ? 'rotate' : 'move';

    dragRef.current = {
      isDragging: true,
      mode,
      elementType: 'receipt',
      elementId: null,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: receiptTransform.x,
      startElementY: receiptTransform.y,
      startRotation: receiptTransform.rotation,
      centerX,
      centerY,
    };

    const startAngle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    );

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;

      if (dragRef.current.mode === 'rotate') {
        const currentAngle = Math.atan2(
          ev.clientY - dragRef.current.centerY,
          ev.clientX - dragRef.current.centerX
        );
        const delta = (currentAngle - startAngle) * (180 / Math.PI);
        updateReceiptTransform({
          rotation: Math.round(dragRef.current.startRotation + delta),
        });
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
      setIsRotateHover(false);
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
        cursor: isRotateHover ? getRotateCursor() : 'move',
        width: width,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Receipt />
      {isSelected && <div className="selection-outline" />}
      {isRotateHover && <div className="rotate-indicator" />}
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
