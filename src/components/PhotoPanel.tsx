import { useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import type { PhotoItem } from '../types';

export function PhotoPanel() {
  const { photos, selectedPhotoId, addPhoto, removePhoto, updatePhoto, selectPhoto } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPhoto: PhotoItem = {
          id: crypto.randomUUID(),
          src: ev.target?.result as string,
          scale: 1,
          x: 0,
          y: 0,
        };
        addPhoto(newPhoto);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScaleChange = (id: string, scale: number) => {
    updatePhoto(id, { scale: Math.max(0.1, Math.min(3, scale)) });
  };

  const handleReplace = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        updatePhoto(id, { src: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="photo-panel">
      <div className="panel-header">
        <h2>사진</h2>
        <button className="btn-add" onClick={() => fileInputRef.current?.click()}>
          + 사진 추가
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="photo-canvas" id="photo-canvas">
        {photos.length === 0 && (
          <div className="empty-state">
            사진을 추가해주세요
          </div>
        )}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`photo-item ${selectedPhotoId === photo.id ? 'selected' : ''}`}
            onClick={() => selectPhoto(photo.id)}
            style={{
              transform: `scale(${photo.scale})`,
            }}
          >
            <img src={photo.src} alt="uploaded" draggable={false} />
          </div>
        ))}
      </div>

      {selectedPhotoId && (
        <div className="photo-controls">
          <label>
            크기:
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={photos.find((p) => p.id === selectedPhotoId)?.scale ?? 1}
              onChange={(e) => handleScaleChange(selectedPhotoId, parseFloat(e.target.value))}
            />
            <span>{((photos.find((p) => p.id === selectedPhotoId)?.scale ?? 1) * 100).toFixed(0)}%</span>
          </label>
          <button className="btn-replace" onClick={() => handleReplace(selectedPhotoId)}>
            교체
          </button>
          <button className="btn-remove" onClick={() => removePhoto(selectedPhotoId)}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
