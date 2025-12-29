import React from 'react';
import { X } from 'lucide-react';

type Props = {
  isDarkMode: boolean;
  onClose: () => void;
};

export function TakeoffHelp({ isDarkMode, onClose }: Props) {
  const theme = isDarkMode
    ? 'bg-slate-900/95 border-slate-700 text-slate-100'
    : 'bg-white/95 border-slate-200 text-slate-900';
  
  const muted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const highlight = isDarkMode ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl border ${theme} max-h-[80vh] overflow-auto`}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b backdrop-blur-sm">
          <h2 className="text-lg font-black uppercase tracking-wide">Takeoff Tools Guide</h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-slate-500/20"
            aria-label="Close help"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tools */}
          <section>
            <h3 className="text-sm font-black uppercase mb-3">📐 Tools</h3>
            <div className="space-y-2">
              <div className={`p-3 rounded ${highlight}`}>
                <div className="font-bold">Select Tool (V)</div>
                <div className={`text-sm ${muted}`}>
                  Click measurements to select. Shift+click for multi-select. Hover to highlight.
                </div>
              </div>
              
              <div className={`p-3 rounded ${highlight}`}>
                <div className="font-bold">Pan Tool (H or Middle Mouse)</div>
                <div className={`text-sm ${muted}`}>
                  Press H to activate pan mode, or use middle mouse button (scroll wheel click) to pan at any time.
                </div>
              </div>
              
              <div className={`p-3 rounded ${highlight}`}>
                <div className="font-bold">Scale Tool (S)</div>
                <div className={`text-sm ${muted}`}>
                  Click two points of known distance, then enter the real-world measurement. Required for accurate measurements.
                </div>
              </div>
              
              <div className={`p-3 rounded ${highlight}`}>
                <div className="font-bold">Linear Tool (L)</div>
                <div className={`text-sm ${muted}`}>
                  Click to place points. Creates polylines for measuring linear distances (pipes, wires, walls).
                  Double-click or press Enter to finish.
                </div>
              </div>
              
              <div className={`p-3 rounded ${highlight}`}>
                <div className="font-bold">Area Tool (A)</div>
                <div className={`text-sm ${muted}`}>
                  Click to place polygon vertices. Calculates square footage for rooms, slabs, etc.
                  Double-click or press Enter to close polygon.
                </div>
              </div>
              
              <div className={`p-3 rounded ${highlight}`}>
                <div className="font-bold">Count Tool (C)</div>
                <div className={`text-sm ${muted}`}>
                  Single-click to place markers. Perfect for counting fixtures, outlets, devices.
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-sm font-black uppercase mb-3">⌨️ Keyboard Shortcuts</h3>
            <div className={`grid grid-cols-2 gap-2 text-sm ${muted}`}>
              <div className="flex justify-between">
                <span className="font-mono font-bold">V</span>
                <span>Select Tool</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">H</span>
                <span>Pan Tool</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">S</span>
                <span>Scale Tool</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">L</span>
                <span>Linear Tool</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">A</span>
                <span>Area Tool</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">C</span>
                <span>Count Tool</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">Ctrl+Z</span>
                <span>Undo</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">Ctrl+Y</span>
                <span>Redo</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">Shift</span>
                <span>Angle Snap (90°)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">Esc</span>
                <span>Cancel / Exit</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">F</span>
                <span>Fullscreen</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">+/-</span>
                <span>Zoom In/Out</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono font-bold">Middle Mouse</span>
                <span>Pan (click & drag)</span>
              </div>
            </div>
          </section>

          {/* Snapping */}
          <section>
            <h3 className="text-sm font-black uppercase mb-3">🧲 Snapping</h3>
            <div className={`p-3 rounded ${highlight}`}>
              <ul className={`list-disc list-inside space-y-1 text-sm ${muted}`}>
                <li><strong>Endpoint Snap:</strong> Automatically snaps to existing measurement endpoints</li>
                <li><strong>Intersection Snap:</strong> Snaps to where two lines intersect</li>
                <li><strong>Angle Snap:</strong> Hold Shift to constrain to 90° angles (horizontal/vertical)</li>
                <li>Green circle indicates active snap point</li>
              </ul>
            </div>
          </section>

          {/* Layers */}
          <section>
            <h3 className="text-sm font-black uppercase mb-3">📚 Layers</h3>
            <div className={`p-3 rounded ${highlight}`}>
              <div className={`text-sm ${muted} space-y-1`}>
                <p>Organize measurements by trade:</p>
                <ul className="list-disc list-inside ml-2">
                  <li><span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#FFD700' }} />Electrical (yellow)</li>
                  <li><span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#4169E1' }} />Plumbing (blue)</li>
                  <li><span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#32CD32' }} />HVAC (green)</li>
                  <li><span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#8B4513' }} />Framing (brown)</li>
                </ul>
                <p className="mt-2">Use eye icon to hide/show layers, lock icon to prevent edits.</p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-sm font-black uppercase mb-3">💡 Tips</h3>
            <div className={`p-3 rounded ${highlight}`}>
              <ul className={`list-disc list-inside space-y-1 text-sm ${muted}`}>
                <li>Always set scale first for accurate measurements</li>
                <li>Scale is saved per-page (each page can have different scale)</li>
                <li>Double-click to finish linear/area measurements</li>
                <li>Use mouse wheel to zoom (Shift+wheel to scroll)</li>
                <li>All measurements are auto-saved to browser storage</li>
                <li>Export to CSV to import into Excel or other tools</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
