import { useState, useRef } from 'react';
import { Plus, Trash2, Play, X, RotateCcw, Palette } from 'lucide-react';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [inputName, setInputName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColors, setCustomColors] = useState<{ bg: string; text: string }[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addName = () => {
    if (inputName.trim() && !names.includes(inputName.trim())) {
      setNames([...names, inputName.trim()]);
      setInputName('');
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
    setWinner(null);
  };

  const spinWheel = () => {
    if (names.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const spins = 5 + Math.random() * 3;
    const extraDegrees = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + extraDegrees;

    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const segmentAngle = 360 / names.length;
      const winningIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % names.length;

      setWinner(names[winningIndex]);
      setIsSpinning(false);
      setShowModal(true);
    }, 4000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addName();
    }
  };

  const removeWinnerAndClose = () => {
    if (winner) {
      setNames(names.filter(name => name !== winner));
      setWinner(null);
      setShowModal(false);
    }
  };

  const spinAgain = () => {
    setShowModal(false);
    setWinner(null);
    setTimeout(() => spinWheel(), 100);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const defaultColors = [
    { bg: '#C80B0F', text: '#FFFFFF' },
    { bg: '#0AA9AE', text: '#FFFFFF' },
    { bg: '#FFFFFF', text: '#000000' },
  ];

  // For rendering: map to bg color array; fallback to default bg colors
  const colors = customColors.length > 0 ? customColors.map(c => c.bg) : defaultColors.map(c => c.bg);

  const addColor = () => {
    const newBg = ('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')).toUpperCase();
    // default text color: white or black depending on bg brightness
    const textDefault = getContrastColor(newBg);
    setCustomColors([...customColors, { bg: newBg, text: textDefault }]);
  };

  // Pick a readable text color (simple luminance check)
  const getContrastColor = (hex: string) => {
    const n = normalizeHex(hex) ?? '#000000';
    const r = parseInt(n.slice(1, 3), 16);
    const g = parseInt(n.slice(3, 5), 16);
    const b = parseInt(n.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  };

  // Normalize shorthand (#FFF) or full (#RRGGBB) hex values to #RRGGBB uppercase.
  const normalizeHex = (input: string): string | null => {
    if (!input) return null;
    let v = input.trim();
    if (!v.startsWith('#')) v = '#' + v;
    // 3-digit shorthand
    const shorthand = /^#([0-9a-fA-F]{3})$/;
    const full = /^#([0-9a-fA-F]{6})$/;
    const mShort = v.match(shorthand);
    if (mShort) {
      const hex = mShort[1].split('').map(c => c + c).join('');
      return ('#' + hex).toUpperCase();
    }
    const mFull = v.match(full);
    if (mFull) {
      return ('#' + mFull[1]).toUpperCase();
    }
    return null;
  };

  // Update color values for bg or text. source indicates which field: 'bg' or 'text'
  const updateColor = (index: number, value: string, field: 'bg' | 'text', source: 'text' | 'picker' = 'text') => {
    const newColors = [...customColors];
    const current = newColors[index] ?? { bg: '#000000', text: '#FFFFFF' };
    if (field === 'bg') {
      const normalized = source === 'picker' ? value.toUpperCase() : normalizeHex(value) ?? value.toUpperCase();
      newColors[index] = { ...current, bg: normalized };
    } else {
      const normalized = normalizeHex(value) ?? value.toUpperCase();
      newColors[index] = { ...current, text: normalized };
    }
    setCustomColors(newColors);
  };

  const onBlurNormalize = (index: number, field: 'bg' | 'text') => {
    const col = customColors[index];
    if (!col) return;
    const normalized = normalizeHex(field === 'bg' ? col.bg : col.text);
    if (normalized) {
      const newColors = [...customColors];
      newColors[index] = { ...newColors[index], [field]: normalized } as { bg: string; text: string };
      setCustomColors(newColors);
    }
  };

  const removeColor = (index: number) => {
    setCustomColors(customColors.filter((_, i) => i !== index));
  };

  const resetColors = () => {
    setCustomColors([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto flex-1">
  <h1 className="text-5xl font-bold text-center mb-8 text-white">
          Wheel of Names
        </h1>
        {!isSpinning && (
          <p className="text-center text-slate-300 mb-12">Add names and spin the wheel!</p>
        )}

        <div className={`grid gap-8 ${isSpinning ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} transition-all`}>
          {!isSpinning && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 opacity-80 text-slate-800">Add Names</h2>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a name..."
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={addName}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {names.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No names added yet</p>
              ) : (
                names.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{name}</span>
                    <button
                      onClick={() => removeName(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={spinWheel}
                disabled={names.length === 0 || isSpinning}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <Play size={24} />
                {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
              </button>

              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
              >
                <Palette size={20} />
                Customize Colors
              </button>
            </div>

            {showColorPicker && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Wheel Colors</h3>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {customColors.length === 0 ? (
                    <p className="text-slate-400 text-center py-4 text-sm">Using default colors</p>
                ) : (
                  customColors.map((color, index) => (
                    <div key={index} className="w-full flex flex-col sm:flex-row sm:items-center gap-4 py-2">
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex flex-col items-start gap-2">
                          <label className="text-xs text-slate-500">Background</label>
                          <div className="flex items-center gap-2">
                            <input
                              aria-label={`Background color for segment ${index + 1}`}
                              type="color"
                              value={normalizeHex(color.bg) ?? '#000000'}
                              onChange={(e) => updateColor(index, e.target.value, 'bg', 'picker')}
                              className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-2 border-slate-200"
                            />
                            <input
                              aria-label={`Background hex for segment ${index + 1}`}
                              type="text"
                              value={color.bg}
                              onChange={(e) => updateColor(index, e.target.value, 'bg', 'text')}
                              onBlur={() => onBlurNormalize(index, 'bg')}
                              placeholder="#RRGGBB or #RGB"
                              className="w-36 sm:w-40 bg-slate-50 px-3 py-2 rounded-lg font-mono text-sm border border-transparent focus:border-slate-300 touch-manipulation"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:ml-6 items-start gap-2">
                          <label className="text-xs text-slate-500">Text color</label>
                          <div className="flex items-center gap-2">
                            <input
                              aria-label={`Text color for segment ${index + 1}`}
                              type="color"
                              value={normalizeHex(color.text) ?? '#FFFFFF'}
                              onChange={(e) => updateColor(index, e.target.value, 'text', 'picker')}
                              className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg cursor-pointer border-2 border-slate-200"
                            />
                            <input
                              aria-label={`Text hex for segment ${index + 1}`}
                              type="text"
                              value={color.text}
                              onChange={(e) => updateColor(index, e.target.value, 'text', 'text')}
                              onBlur={() => onBlurNormalize(index, 'text')}
                              placeholder="#RRGGBB or #RGB"
                              className="w-36 sm:w-40 bg-slate-50 px-3 py-2 rounded-lg font-mono text-sm border border-transparent focus:border-slate-300 touch-manipulation"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:items-start">
                        <button
                          onClick={() => removeColor(index)}
                          className="text-red-500 hover:text-red-700 transition-colors mt-2 sm:mt-0"
                          aria-label={`Remove color ${index + 1}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addColor}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <Plus size={18} />
                    Add Color
                  </button>
                  {customColors.length > 0 && (
                    <button
                      onClick={resetColors}
                      className="bg-slate-500 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
          )}

          <div className={`flex items-center justify-center ${isSpinning ? 'col-span-1' : ''}`}>
            {/* Responsive wheel container: smaller on phones, medium on tablets, large when spinning on desktop */}
            <div className={`relative transition-all duration-500 w-64 h-64 sm:w-96 sm:h-96 ${isSpinning ? 'md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px]' : ''}`}>
              {/* Pointer arrow: scale down on small screens */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-red-600 z-20 transition-all duration-500 sm:border-l-[20px] sm:border-r-[20px] sm:border-t-[40px] ${isSpinning ? '-mt-2' : '-mt-2'}`}></div>

              <div
                ref={wheelRef}
                className="w-full h-full rounded-full shadow-2xl relative overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
              >
                {names.length === 0 ? (
                  <div className="w-full h-full bg-slate-300 flex items-center justify-center">

                  </div>
                ) : (
                  <>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {names.map((name, index) => {
                        const segmentAngle = 360 / names.length;
                        const startAngle = index * segmentAngle - 90;
                        const endAngle = startAngle + segmentAngle;

                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        const midRad = ((startAngle + segmentAngle / 2) * Math.PI) / 180;

                        const x1 = 50 + 50 * Math.cos(startRad);
                        const y1 = 50 + 50 * Math.sin(startRad);
                        const x2 = 50 + 50 * Math.cos(endRad);
                        const y2 = 50 + 50 * Math.sin(endRad);

                        const textX = 50 + 35 * Math.cos(midRad);
                        const textY = 50 + 35 * Math.sin(midRad);

                        const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                        return (
                          <g key={index}>
                            <path
                              d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                              fill={colors[index % colors.length]}
                              stroke="white"
                              strokeWidth="0.5"
                            />
                                <text
                                  x={textX}
                                  y={textY}
                                  fill={
                                    (customColors[index] && customColors[index].text)
                                      ? (normalizeHex(customColors[index].text) ?? '#FFFFFF')
                                      : (defaultColors[index % defaultColors.length].text ?? '#FFFFFF')
                                  }
                                  fontSize="4"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  transform={`rotate(${startAngle + segmentAngle / 2 + 90}, ${textX}, ${textY})`}
                                >
                                  {name}
                                </text>
                          </g>
                        );
                      })}
                    </svg>
                  </>
                )}
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg border-4 border-slate-800 z-10"></div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-sm">
        <a href="https://www.driesbielen.be" target="_blank" rel="noreferrer" className="text-slate-200 hover:underline">Created by Dries Bielen</a>
      </footer>

      {showModal && winner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleIn">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <X size={28} />
              </button>

              <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-12 text-center">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce">🎉</div>
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3">Winner!</h2>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl py-4 px-6 sm:py-6 sm:px-8 inline-block">
                  <p className="text-3xl sm:text-6xl font-black text-white drop-shadow-lg break-words">{winner}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={removeWinnerAndClose}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                >
                  <Trash2 size={18} />
                  <span className="text-sm sm:text-base">Remove from List</span>
                </button>
                <button
                  onClick={spinAgain}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                >
                  <RotateCcw size={18} />
                  <span className="text-sm sm:text-base">Spin Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
