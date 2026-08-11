import { useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Receipt } from './Receipt';
import type { PhotoItem } from '../types';

interface DragState {
  isDragging: boolean;
  elementType: 'photo' | 'receipt' | null;
  elementId: string | null;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
}

function PhotoElement({ photo, isSelected, scale }: { photo: PhotoItem; isSelected: boolean; scale: number }) {
  const { selectElement, updatePhotoTransform } = useAppStore();
  const dragRef = useRef<DragState>({
    isDragging: false,
    elementType: null,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ type: 'photo', id: photo.id });
    dragRef.current = {
      isDragging: true,
      elementType: 'photo',
      elementId: photo.id,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: photo.transform.x,
      startElementY: photo.transform.y,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = (ev.clientX - dragRef.current.startX) / scale;
      const dy = (ev.clientY - dragRef.current.startY) / scale;
      updatePhotoTransform(photo.id, {
        x: dragRef.current.startElementX + dx,
        y: dragRef.current.startElementY + dy,
      });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const { x, y, scale: photoScale, rotation } = photo.transform;
  const { offsetX, offsetY, blur, spread, color, opacity } = photo.shadow;
  const shadowColor = color + Math.round(opacity * 255).toString(16).padStart(2, '0');

  return (
    <div
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${photoScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: 'move',
        border: `${photo.borderWidth}px solid ${photo.borderColor}`,
        boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}`,
        background: '#fff',
        padding: photo.borderWidth > 0 ? '4px' : '0',
      }}
      onMouseDown={handleMouseDown}
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
    </div>
  );
}

function ReceiptElement({ isSelected, scale }: { isSelected: boolean; scale: number }) {
  const { receiptTransform, selectElement, updateReceiptTransform } = useAppStore();
  const dragRef = useRef<DragState>({
    isDragging: false,
    elementType: null,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ type: 'receipt' });
    dragRef.current = {
      isDragging: true,
      elementType: 'receipt',
      elementId: null,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: receiptTransform.x,
      startElementY: receiptTransform.y,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = (ev.clientX - dragRef.current.startX) / scale;
      const dy = (ev.clientY - dragRef.current.startY) / scale;
      updateReceiptTransform({
        x: dragRef.current.startElementX + dx,
        y: dragRef.current.startElementY + dy,
      });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const { x, y, scale: rScale, rotation, width } = receiptTransform;

  return (
    <div
      className={`canvas-element ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${rScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        cursor: 'move',
        width: width,
      }}
      onMouseDown={handleMouseDown}
    >
      <Receipt />
      {isSelected && <div className="selection-outline" />}
    </div>
  );
}

export function Canvas() {
  const { canvas, photos, selectedElement, selectElement } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewScale, setViewScale] = useState(0.5);

  // 컨테이너 크기에 맞춰 뷰 스케일 자동 조절
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
          {/* Photos */}
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

          {/* Receipt */}
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
