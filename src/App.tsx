import { useState } from 'react';
import { PhotoPanel } from './components/PhotoPanel';
import { Receipt } from './components/Receipt';
import { ReceiptEditor } from './components/ReceiptEditor';
import { VideoExporter } from './components/VideoExporter';
import './App.css';

function App() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>영수증 영상 메이커</h1>
        <div className="header-actions">
          <button
            className={`btn-toggle-editor ${showEditor ? 'active' : ''}`}
            onClick={() => setShowEditor(!showEditor)}
          >
            {showEditor ? '편집기 닫기' : '영수증 편집'}
          </button>
          <VideoExporter />
        </div>
      </header>

      <main className="app-main">
        <div className="main-canvas" id="main-canvas">
          <div className="canvas-left">
            <PhotoPanel />
          </div>
          <div className="canvas-right">
            <Receipt />
          </div>
        </div>

        {showEditor && (
          <aside className="editor-sidebar">
            <ReceiptEditor />
          </aside>
        )}
      </main>
    </div>
  );
}

export default App;
