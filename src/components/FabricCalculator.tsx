import React, { useState } from 'react';
import { Calculator, Scissors, Edit3, RotateCcw } from 'lucide-react';
import { calculateOptimalCuts, CalculationResult, FabricSize, DEFAULT_FABRIC_SIZES } from '../utils/fabricCalculator';

export default function FabricCalculator() {
  const [totalLength, setTotalLength] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [fabricSizes, setFabricSizes] = useState<FabricSize[]>(DEFAULT_FABRIC_SIZES);
  const [editingSize, setEditingSize] = useState<number | null>(null);

  // Color scheme for different fabric sizes
  const sizeColors = {
    2.5: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-blue-800',
    3: 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-300 text-emerald-800',
    2.25: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-purple-800',
    2: 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300 text-amber-800',
    5: 'bg-gradient-to-br from-rose-100 to-rose-200 border-rose-300 text-rose-800',
    1: 'bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800'
  };

  const handleCalculate = () => {
    const length = parseFloat(totalLength);
    if (isNaN(length) || length <= 0) {
      return;
    }

    setIsCalculating(true);
    // Add a small delay for smooth UX
    setTimeout(() => {
      const calculationResult = calculateOptimalCuts(length, fabricSizes);
      setResult(calculationResult);
      setIsCalculating(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTotalLength(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const handleDemandChange = (size: number, newDemand: string) => {
    const demand = parseInt(newDemand) || 0;
    setFabricSizes(prev => 
      prev.map(item => 
        item.size === size ? { ...item, weeklyDemand: demand } : item
      )
    );
  };

  const handleCardClick = (size: number) => {
    setEditingSize(editingSize === size ? null : size);
  };

  const handleInputBlur = () => {
    setEditingSize(null);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingSize(null);
    }
  };

  const resetToDefaults = () => {
    setFabricSizes(DEFAULT_FABRIC_SIZES);
    setResult(null);
    setEditingSize(null);
  };

  // Format numbers to show minimal decimal places
  const formatNumber = (num: number): string => {
    // If it's a whole number, don't show decimals
    if (num === Math.floor(num)) {
      return num.toString();
    }
    // Otherwise, show up to 2 decimal places, removing trailing zeros
    return parseFloat(num.toFixed(2)).toString();
  };

  const totalDemand = fabricSizes.reduce((sum, item) => sum + item.weeklyDemand, 0);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-3">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Fabric Cutting Calculator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Smart fabric cutting with zero-leftover optimization based on demand probabilities.
          </p>
        </div>
        {/* Input Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <span className="text-blue-600 mr-2">🎯</span>
              <span className="font-semibold text-blue-800">Smart Zero-Leftover Optimization</span>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              The calculator prioritizes high-demand fabric sizes (≥15% probability) and ensures they're always included. 
              Lower-demand sizes may be excluded if they prevent achieving zero leftover.
            </p>
            <div className="text-xs text-blue-600">
              <span className="font-medium">Priority system:</span> High-demand sizes are guaranteed inclusion, 
              while low-demand sizes are optional for optimal cutting.
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="fabric-length" className="block text-sm font-semibold text-gray-700 mb-2">
                Total Fabric Length (meters)
              </label>
              <input
                id="fabric-length"
                type="text"
                value={totalLength}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter fabric length (e.g., 32.5)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>
            <button
              onClick={handleCalculate}
              disabled={!totalLength || parseFloat(totalLength) <= 0 || isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Calculate Optimal Cuts</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            {/* Zero Leftover Success Banner */}
            {result.leftover === 0 && (
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg p-4 mb-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-2">🎯</span>
                  <span className="text-lg font-bold">Perfect Cut Achieved!</span>
                </div>
                <p className="text-emerald-100">Zero leftover fabric - maximum efficiency reached!</p>
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Scissors className="w-6 h-6 text-green-600" />
              </div>
              Optimal Cut Plan {result.leftover === 0 && <span className="ml-2 text-emerald-600">✨</span>}
            </h2>

            {result.cuts.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Size (m)</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Pieces</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.cuts
                        .sort((a, b) => b.pieces - a.pieces) // Sort by pieces (highest first)
                        .map((cut, index) => (
                        <tr 
                          key={cut.size} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">{formatNumber(cut.size)}m</td>
                          <td className="py-3 px-4 text-center text-gray-700">{cut.pieces}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">{formatNumber(cut.total)}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(result.totalUsed)}m</div>
                    <div className="text-sm text-blue-700 font-medium">Total Used</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.cuts.reduce((sum, cut) => sum + cut.pieces, 0)}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Total Pieces</div>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${
                    result.leftover === 0 ? 'bg-emerald-50 border-2 border-emerald-200' : 
                    result.leftover > 0.1 ? 'bg-amber-50' : 'bg-green-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      result.leftover === 0 ? 'text-emerald-600' :
                      result.leftover > 0.1 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {formatNumber(result.leftover)}m
                    </div>
                    <div className={`text-sm font-medium ${
                      result.leftover === 0 ? 'text-emerald-700' :
                      result.leftover > 0.1 ? 'text-amber-700' : 'text-green-700'
                    }`}>
                      {result.leftover === 0 ? '🎯 Zero Leftover!' : 'Leftover'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Scissors className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No cuts possible with the given fabric length.</p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Demand Editor */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Demand Settings
            </h3>
            <div>
              <button
                onClick={resetToDefaults}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Click on any card to edit its weekly demand</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fabricSizes.map((item) => {
              const percentage = totalDemand > 0 ? ((item.weeklyDemand / totalDemand) * 100).toFixed(1) : '0.0';
              const isHighPriority = (item.weeklyDemand / totalDemand) >= 0.15; // 15% threshold
              const colorClass = sizeColors[item.size as keyof typeof sizeColors] || 'bg-gray-50 border-gray-300 text-gray-800';
              const isEditing = editingSize === item.size;
              return (
                <div 
                  key={item.size} 
                  className={`${colorClass} border rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer relative ${
                    isEditing ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  } ${isHighPriority ? 'ring-2 ring-emerald-400' : ''}`}
                  onClick={() => handleCardClick(item.size)}
                >
                  {isHighPriority && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ⭐
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-bold text-xl mb-2">{formatNumber(item.size)}m</div>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={item.weeklyDemand}
                        onChange={(e) => handleDemandChange(item.size, e.target.value)}
                        onBlur={handleInputBlur}
                        onKeyPress={handleInputKeyPress}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="text-sm font-medium mb-1">{item.weeklyDemand} pieces</div>
                    )}
                    <div className="text-xs font-semibold opacity-75">
                      {percentage}% {isHighPriority ? '(Priority)' : '(Optional)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {totalDemand > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-center text-sm text-gray-600">
                Total weekly demand: <span className="font-semibold">{totalDemand} pieces</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-2">
                    ⭐
                  </div>
                  <span>Priority sizes (≥15%) - Always included</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                  <span>Optional sizes (&lt;15%) - May be excluded for zero leftover</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}