import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { ReceiptEditor } from './components/ReceiptEditor';
import { VideoExporter } from './components/VideoExporter';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'controls' | 'receipt'>('controls');

  return (
    <div className="app">
      <header className="app-header">
        <h1>영수증 영상 메이커</h1>
        <VideoExporter />
      </header>

      <main className="app-main">
        {/* 왼쪽: 컨트롤 패널 */}
        <aside className="sidebar-panel">
          <div className="tab-bar">
            <button
              className={`tab ${activeTab === 'controls' ? 'active' : ''}`}
              onClick={() => setActiveTab('controls')}
            >
              설정
            </button>
            <button
              className={`tab ${activeTab === 'receipt' ? 'active' : ''}`}
              onClick={() => setActiveTab('receipt')}
            >
              영수증 편집
            </button>
          </div>
          <div className="sidebar-content">
            {activeTab === 'controls' ? <ControlPanel /> : <ReceiptEditor />}
          </div>
        </aside>

        {/* 오른쪽: 1920x1080 캔버스 */}
        <div className="canvas-area">
          <Canvas />
        </div>
      </main>
    </div>
  );
}

export default App;
