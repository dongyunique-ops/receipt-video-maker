import { useRef, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';

export function VideoExporter() {
  const { isRecording, setRecording } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const exportVideo = useCallback(async () => {
    const mainContent = document.getElementById('main-canvas');
    if (!mainContent) {
      alert('캡처할 콘텐츠를 찾을 수 없습니다.');
      return;
    }

    setRecording(true);

    try {
      // html2canvas를 동적으로 로드
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(mainContent, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      // MediaRecorder를 사용하여 mp4 생성
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
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

      // 3초간 녹화 (정적 이미지이므로 짧게)
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000);
    } catch (error) {
      console.error('영상 출력 실패:', error);
      alert('영상 출력에 실패했습니다.');
      setRecording(false);
    }
  }, [setRecording]);

  const exportAsImage = useCallback(async () => {
    const mainContent = document.getElementById('main-canvas');
    if (!mainContent) {
      alert('캡처할 콘텐츠를 찾을 수 없습니다.');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mainContent, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${Date.now()}.png`;
      a.click();
    } catch (error) {
      console.error('이미지 출력 실패:', error);
      alert('이미지 출력에 실패했습니다.');
    }
  }, []);

  return (
    <div className="video-exporter">
      <button
        className="btn-export-video"
        onClick={exportVideo}
        disabled={isRecording}
      >
        {isRecording ? '녹화 중...' : '영상 출력 (WebM)'}
      </button>
      <button
        className="btn-export-image"
        onClick={exportAsImage}
        disabled={isRecording}
      >
        이미지 출력 (PNG)
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
