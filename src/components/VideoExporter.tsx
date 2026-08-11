import { useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';

export function VideoExporter() {
  const { isRecording, setRecording, canvas } = useAppStore();

  const exportVideo = useCallback(async () => {
    const frame = document.getElementById('canvas-frame');
    if (!frame) {
      alert('캡처할 콘텐츠를 찾을 수 없습니다.');
      return;
    }

    setRecording(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const capturedCanvas = await html2canvas(frame, {
        backgroundColor: null,
        scale: 1,
        width: canvas.width,
        height: canvas.height,
        useCORS: true,
      });

      const stream = capturedCanvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-video-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setRecording(false);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 3000);
    } catch (error) {
      console.error('영상 출력 실패:', error);
      alert('영상 출력에 실패했습니다.');
      setRecording(false);
    }
  }, [setRecording, canvas]);

  const exportAsImage = useCallback(async () => {
    const frame = document.getElementById('canvas-frame');
    if (!frame) {
      alert('캡처할 콘텐츠를 찾을 수 없습니다.');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const capturedCanvas = await html2canvas(frame, {
        backgroundColor: null,
        scale: 1,
        width: canvas.width,
        height: canvas.height,
        useCORS: true,
      });

      const url = capturedCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${Date.now()}.png`;
      a.click();
    } catch (error) {
      console.error('이미지 출력 실패:', error);
      alert('이미지 출력에 실패했습니다.');
    }
  }, [canvas]);

  return (
    <div className="video-exporter">
      <button className="btn-export" onClick={exportVideo} disabled={isRecording}>
        {isRecording ? '녹화 중...' : '🎬 영상 출력'}
      </button>
      <button className="btn-export" onClick={exportAsImage} disabled={isRecording}>
        📷 이미지 출력
      </button>
    </div>
  );
}
