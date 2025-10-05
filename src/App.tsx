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
  const [customColors, setCustomColors] = useState<string[]>([]);
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
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  const colors = customColors.length > 0 ? customColors : defaultColors;

  const addColor = () => {
    const newColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setCustomColors([...customColors, newColor]);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...customColors];
    newColors[index] = color;
    setCustomColors(newColors);
  };

  const removeColor = (index: number) => {
    setCustomColors(customColors.filter((_, i) => i !== index));
  };

  const resetColors = () => {
    setCustomColors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 text-white">
          Wheel of Names
        </h1>
        <p className="text-center text-slate-300 mb-12">Add names and spin the wheel!</p>

        <div className={`grid gap-8 ${isSpinning ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} transition-all`}>
          {!isSpinning && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-800">Add Names</h2>

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
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
                        />
                        <div className="flex-1 bg-slate-50 px-3 py-2 rounded-lg font-mono text-sm">
                          {color.toUpperCase()}
                        </div>
                        <button
                          onClick={() => removeColor(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
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
            <div className={`relative transition-all duration-500 ${isSpinning ? 'w-[600px] h-[600px]' : 'w-96 h-96'}`}>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 z-20 transition-all duration-500 ${isSpinning ? '-mt-2' : '-mt-2'}`}></div>

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
                    <p className="text-slate-500 font-semibold">Add names</p>
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
                              fill="white"
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

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-slate-800 z-10"></div>
            </div>
          </div>
        </div>
      </div>

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
                <div className="text-8xl mb-6 animate-bounce">🎉</div>
                <h2 className="text-5xl font-bold text-white mb-3">Winner!</h2>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl py-6 px-8 inline-block">
                  <p className="text-6xl font-black text-white drop-shadow-lg">{winner}</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-2 gap-4">
                <button
                  onClick={removeWinnerAndClose}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                >
                  <Trash2 size={20} />
                  Remove from List
                </button>
                <button
                  onClick={spinAgain}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                >
                  <RotateCcw size={20} />
                  Spin Again
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
