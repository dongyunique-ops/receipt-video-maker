import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { VideoExporter } from './components/VideoExporter';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>영수증 영상 메이커</h1>
        <VideoExporter />
      </header>

      <main className="app-main">
        <aside className="sidebar-panel">
          <div className="sidebar-content">
            <ControlPanel />
          </div>
        </aside>

        <div className="canvas-area">
          <Canvas />
        </div>
      </main>
    </div>
  );
}

export default App;
