import { useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import type { PhotoItem } from '../types';

export function ControlPanel() {
  const {
    photos,
    selectedElement,
    canvas,
    addPhoto,
    removePhoto,
    updatePhotoTransform,
    updatePhotoShadow,
    updatePhotoBorder,
    setBackground,
    setBackgroundColor,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const selectedPhoto =
    selectedElement?.type === 'photo'
      ? photos.find((p) => p.id === selectedElement.id)
      : null;

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxW = 400;
          const ratio = img.width / img.height;
          const w = Math.min(img.width, maxW);
          const h = w / ratio;

          const newPhoto: PhotoItem = {
            id: crypto.randomUUID(),
            src: ev.target?.result as string,
            transform: { x: 100, y: 100, scale: 1, rotation: 0 },
            shadow: {
              offsetX: 4,
              offsetY: 6,
              blur: 12,
              spread: 2,
              color: '#000000',
              opacity: 0.3,
            },
            borderWidth: 6,
            borderColor: '#ffffff',
            width: w,
            height: h,
          };
          addPhoto(newPhoto);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBackground(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  return (
    <div className="control-panel">
      {/* 배경 섹션 */}
      <section className="ctrl-section">
        <h3>배경</h3>
        <div className="ctrl-row">
          <button className="btn-primary" onClick={() => bgInputRef.current?.click()}>
            배경 이미지 변경
          </button>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            onChange={handleBgChange}
            style={{ display: 'none' }}
          />
          {canvas.background && (
            <button className="btn-secondary" onClick={() => setBackground(null)}>
              제거
            </button>
          )}
        </div>
        <label className="ctrl-label">
          배경색:
          <input
            type="color"
            value={canvas.backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </label>
      </section>

      {/* 사진 추가 */}
      <section className="ctrl-section">
        <h3>사진</h3>
        <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
          + 사진 추가
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddPhoto}
          style={{ display: 'none' }}
        />
      </section>

      {/* 선택된 사진 컨트롤 */}
      {selectedPhoto && (
        <section className="ctrl-section">
          <h3>사진 설정</h3>

          <label className="ctrl-label">
            크기: {Math.round(selectedPhoto.transform.scale * 100)}%
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={selectedPhoto.transform.scale}
              onChange={(e) =>
                updatePhotoTransform(selectedPhoto.id, { scale: parseFloat(e.target.value) })
              }
            />
          </label>

          <label className="ctrl-label">
            회전: {selectedPhoto.transform.rotation}°
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={selectedPhoto.transform.rotation}
              onChange={(e) =>
                updatePhotoTransform(selectedPhoto.id, { rotation: parseInt(e.target.value) })
              }
            />
          </label>

          <h4>테두리</h4>
          <label className="ctrl-label">
            두께: {selectedPhoto.borderWidth}px
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={selectedPhoto.borderWidth}
              onChange={(e) =>
                updatePhotoBorder(selectedPhoto.id, { borderWidth: parseInt(e.target.value) })
              }
            />
          </label>
          <label className="ctrl-label">
            색상:
            <input
              type="color"
              value={selectedPhoto.borderColor}
              onChange={(e) =>
                updatePhotoBorder(selectedPhoto.id, { borderColor: e.target.value })
              }
            />
          </label>

          <h4>그림자</h4>
          <label className="ctrl-label">
            X: {selectedPhoto.shadow.offsetX}
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={selectedPhoto.shadow.offsetX}
              onChange={(e) =>
                updatePhotoShadow(selectedPhoto.id, { offsetX: parseInt(e.target.value) })
              }
            />
          </label>
          <label className="ctrl-label">
            Y: {selectedPhoto.shadow.offsetY}
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={selectedPhoto.shadow.offsetY}
              onChange={(e) =>
                updatePhotoShadow(selectedPhoto.id, { offsetY: parseInt(e.target.value) })
              }
            />
          </label>
          <label className="ctrl-label">
            블러: {selectedPhoto.shadow.blur}
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={selectedPhoto.shadow.blur}
              onChange={(e) =>
                updatePhotoShadow(selectedPhoto.id, { blur: parseInt(e.target.value) })
              }
            />
          </label>
          <label className="ctrl-label">
            확산: {selectedPhoto.shadow.spread}
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={selectedPhoto.shadow.spread}
              onChange={(e) =>
                updatePhotoShadow(selectedPhoto.id, { spread: parseInt(e.target.value) })
              }
            />
          </label>
          <label className="ctrl-label">
            투명도: {Math.round(selectedPhoto.shadow.opacity * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selectedPhoto.shadow.opacity}
              onChange={(e) =>
                updatePhotoShadow(selectedPhoto.id, { opacity: parseFloat(e.target.value) })
              }
            />
          </label>
          <label className="ctrl-label">
            색상:
            <input
              type="color"
              value={selectedPhoto.shadow.color}
              onChange={(e) =>
                updatePhotoShadow(selectedPhoto.id, { color: e.target.value })
              }
            />
          </label>

          <button className="btn-danger" onClick={() => removePhoto(selectedPhoto.id)}>
            사진 삭제
          </button>
        </section>
      )}
    </div>
  );
}
