import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Building2, Users, MessageCircle, Brain, Menu, X, Twitter, ScanFace, 
  TrendingUp, Search, Bell, ChevronDown, Shapes, Book, Settings2, 
  DollarSign, Chrome, Handshake, Heart, Check, Calendar, CheckCircle2, Type,
  Move, Pencil, ArrowUpRight, Grid3X3, RotateCw, ZoomIn, ZoomOut, Download,
  Image as ImageIcon, ChevronUp, Trash2, Crop, Save, Square } from 'lucide-react';

// Predefined meme templates with hotspots
const MEME_LIBRARY = [
  {
    "id": 1,
    "name": "Drake Hotline Bling",
    "url": "https://i.imgflip.com/4/30b1gx.jpg",
    "thumbnail": "https://i.imgflip.com/4/30b1gx.jpg",
    "hotspots": [
      {
        "x": 350,
        "y": 120,
        "width": 300,
        "height": 80,
        "defaultText": "Top text",
        "fontSize": 24,
        "color": "#000000"
      },
      {
        "x": 350,
        "y": 320,
        "width": 300,
        "height": 80,
        "defaultText": "Bottom text",
        "fontSize": 24,
        "color": "#000000"
      }
    ]
  },
  // ... rest of your MEME_LIBRARY data
];

// Image library configuration
const IMAGE_LIBRARY = [
  {
    id: 'stock-1',
    name: 'Business Meeting',
    url: '/api/placeholder/400/300',
    tags: ['business', 'meeting', 'office'],
    category: 'business'
  }
  // ... rest of your images
];

function TrainingDataManager() {
  // Refs
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);

  // State
  const [selectedTool, setSelectedTool] = useState('select');
  const [showImageLibrary, setShowImageLibrary] = useState(true);
  const [showMemeLibrary, setShowMemeLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);
  const [activeObject, setActiveObject] = useState(null);
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textAlign, setTextAlign] = useState('left');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [shapeFill, setShapeFill] = useState('#ffffff');
  const [shapeStroke, setShapeStroke] = useState('#000000');

  useEffect(() => {
    // Initialize Fabric canvas
    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true
    });

    // Load saved templates
    const savedTemplates = localStorage.getItem('canvasTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }

    // Setup event listeners
    fabricRef.current.on('selection:created', handleSelectionChange);
    fabricRef.current.on('selection:updated', handleSelectionChange);
    fabricRef.current.on('selection:cleared', handleSelectionCleared);

    return () => {
      fabricRef.current.dispose();
    };
  }, []);

  const handleSelectionChange = (e) => {
    const obj = e.target;
    setActiveObject(obj);
    setShowStyleOptions(true);

    if (obj.type === 'textbox') {
      setFontSize(obj.fontSize);
      setFontFamily(obj.fontFamily);
      setTextAlign(obj.textAlign);
      setSelectedColor(obj.fill);
    } else if (obj.type === 'rect') {
      setShapeFill(obj.fill);
      setShapeStroke(obj.stroke);
      setStrokeWidth(obj.strokeWidth);
    }
  };

  const handleSelectionCleared = () => {
    setActiveObject(null);
    setShowStyleOptions(false);
  };

  const addRectangle = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: shapeFill,
      stroke: shapeStroke,
      strokeWidth: strokeWidth
    });
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.renderAll();
  };

  const addText = () => {
    const text = new fabric.Textbox('Double click to edit', {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: selectedColor,
      width: 200,
      textAlign: textAlign
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const handleSaveCanvas = () => {
    const canvasState = JSON.stringify(fabricRef.current.toJSON());
    const blob = new Blob([canvasState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvas-state.json';
    link.click();
  };

  const handleLoadCanvas = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const state = JSON.parse(e.target.result);
        fabricRef.current.loadFromJSON(state, () => {
          fabricRef.current.renderAll();
        });
      };
      reader.readAsText(file);
    }
  };

  const handleExportPNG = () => {
    const dataURL = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas-export.png';
    link.click();
  };

  const moveLayer = (direction) => {
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;

    if (direction === 'up') {
      obj.bringForward();
    } else {
      obj.sendBackwards();
    }
    fabricRef.current.renderAll();
  };

  const handleAddMeme = (meme) => {
    fabric.Image.fromURL(meme.url, (img) => {
      img.scaleToWidth(400);
      fabricRef.current.add(img);

      // Add text for each hotspot
      meme.hotspots.forEach(hotspot => {
        const text = new fabric.Textbox(hotspot.defaultText, {
          left: hotspot.x,
          top: hotspot.y,
          width: hotspot.width,
          fontSize: hotspot.fontSize,
          fill: hotspot.color,
          fontFamily: 'Impact'
        });
        fabricRef.current.add(text);
      });

      fabricRef.current.renderAll();
    });
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-96 bg-white p-4 overflow-y-auto border-r">
        {/* Toggle buttons */}
        <div className="flex mb-4 gap-2">
          <button
            className={`p-2 rounded w-full ${showImageLibrary ? 'bg-green-600 text-white' : 'bg-slate-100'}`}
            onClick={() => {
              setShowImageLibrary(true);
              setShowMemeLibrary(false);
            }}
          >
            Images
          </button>
          <button
            className={`p-2 rounded w-full ${showMemeLibrary ? 'bg-green-600 text-white' : 'bg-slate-100'}`}
            onClick={() => {
              setShowImageLibrary(false);
              setShowMemeLibrary(true);
            }}
          >
            Memes
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content area */}
        {showMemeLibrary ? (
          // Meme Library
          <div className="grid grid-cols-2 gap-2">
            {MEME_LIBRARY.filter(meme => 
              meme.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((meme) => (
              <div
                key={meme.id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddMeme(meme)}
              >
                <img
                  src={meme.thumbnail}
                  alt={meme.name}
                  className="w-full h-32 object-cover mb-1 rounded"
                />
                <p className="text-sm truncate">{meme.name}</p>
              </div>
            ))}
          </div>
        ) : (
          // Templates and Images
          <div className="space-y-2">
            {/* Saved Templates Section */}
            <h3 className="font-bold mb-2">Saved Templates</h3>
            {templates.map((template) => (
              <div key={template.id} className="p-2 border rounded">
                <p className="font-medium">{template.name}</p>
                {template.thumbnail && (
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-32 object-cover my-2 rounded"
                  />
                )}
                <div className="flex justify-end gap-2">
                  <button
                    className="p-1 hover:bg-slate-100 rounded"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    Load
                  </button>
                  <button
                    className="p-1 hover:bg-slate-100 rounded text-red-500"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Toolbar */}
        <div className="mb-4 p-2 bg-white rounded-lg shadow flex items-center gap-2">
          <button
            className={`p-2 rounded ${selectedTool === 'select' ? 'bg-green-600 text-white' : 'hover:bg-slate-100'}`}
            onClick={() => setSelectedTool('select')}
          >
            <Move size={20} />
          </button>

          <button
            className={`p-2 rounded hover:bg-slate-100`}
            onClick={addText}
          >
            <Type size={20} />
          </button>

          <button
            className={`p-2 rounded hover:bg-slate-100`}
            onClick={addRectangle}
          >
            <Square size={20} />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <button
            className="p-2 rounded hover:bg-slate-100"
            onClick={() => moveLayer('up')}
          >
            <ChevronUp size={20} />
          </button>

          <button
            className="p-2 rounded hover:bg-slate-100"
            onClick={() => moveLayer('down')}
          >
            <ChevronDown size={20} />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleLoadCanvas(e)}
            className="hidden"
            id="load-canvas"
          />
          <label
            htmlFor="load-canvas"
            className="p-2 rounded hover:bg-slate-100 cursor-pointer"
          >
            Load Canvas
          </label>

          <button
            className="p-2 rounded hover:bg-slate-100"
            onClick={handleSaveCanvas}
          >
            <Save size={20} />
          </button>

          <button
            className="p-2 rounded hover:bg-slate-100"
            onClick={handleExportPNG}
          >
            <Download size={20} />
          </button>
        </div>

        {/* Style Options */}
        {showStyleOptions && (
          <div className="mb-4 p-2 bg-white rounded-lg shadow">
            {activeObject?.type === 'textbox' ? (
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    activeObject.set({ fill: e.target.value });
                    fabricRef.current.renderAll();
                  }}
                />
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    activeObject.set({ fontSize: parseInt(e.target.value) });
                    fabricRef.current.renderAll();
                  }}
                  min="8"
                  max="72"
                  className="w-16 p-1 border rounded"
                />
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    activeObject.set({ fontFamily: e.target.value });
                    fabricRef.current.renderAll();
                  }}
                  className="p-1 border rounded"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans</option>
                  <option value="Verdana">Verdana</option>
                </select>
                <select
                  value={textAlign}
                  onChange={(e) => {
                    setTextAlign(e.target.value);
                    activeObject.set({ textAlign: e.target.value });
                    fabricRef.current.renderAll();
                  }}
                  className="p-1 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            ) : activeObject?.type === 'rect' ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Fill:</span>
                  <input
                    type="color"
                    value={shapeFill}
                    onChange={(e) => {
                      setShapeFill(e.target.value);
                      activeObject.set({ fill: e.target.value });
                      fabricRef.current.renderAll();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Stroke:</span>
                  <input
                    type="color"
                    value={shapeStroke}
                    onChange={(e) => {
                      setShapeStroke(e.target.value);
                      activeObject.set({ stroke: e.target.value });
                      fabricRef.current.renderAll();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Stroke Width:</span>
                  <input
                    type="number"
                    value={strokeWidth}
                    onChange={(e) => {
                      setStrokeWidth(parseInt(e.target.value));
                      activeObject.set({ strokeWidth: parseInt(e.target.value) });
                      fabricRef.current.renderAll();
                    }}
                    min="0"
                    max="20"
                    className="w-16 p-1 border rounded"
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Canvas Container */}
        <div className="flex-1 bg-gray-200 rounded-lg p-4 flex items-center justify-center">
          <div className="bg-white shadow-lg">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Properties Panel */}
        {activeObject && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">Object Properties</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Position */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Position X</label>
                <input
                  type="number"
                  value={Math.round(activeObject.left)}
                  onChange={(e) => {
                    activeObject.set({ left: parseInt(e.target.value) });
                    fabricRef.current.renderAll();
                  }}
                  className="w-full p-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Position Y</label>
                <input
                  type="number"
                  value={Math.round(activeObject.top)}
                  onChange={(e) => {
                    activeObject.set({ top: parseInt(e.target.value) });
                    fabricRef.current.renderAll();
                  }}
                  className="w-full p-1 border rounded"
                />
              </div>

              {/* Size */}
              {activeObject.width !== undefined && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      value={Math.round(activeObject.width * activeObject.scaleX)}
                      onChange={(e) => {
                        const newWidth = parseInt(e.target.value);
                        activeObject.set({ scaleX: newWidth / activeObject.width });
                        fabricRef.current.renderAll();
                      }}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Height</label>
                    <input
                      type="number"
                      value={Math.round(activeObject.height * activeObject.scaleY)}
                      onChange={(e) => {
                        const newHeight = parseInt(e.target.value);
                        activeObject.set({ scaleY: newHeight / activeObject.height });
                        fabricRef.current.renderAll();
                      }}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                </>
              )}

              {/* Rotation */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rotation (degrees)</label>
                <input
                  type="number"
                  value={Math.round(activeObject.angle || 0)}
                  onChange={(e) => {
                    activeObject.set({ angle: parseInt(e.target.value) });
                    fabricRef.current.renderAll();
                  }}
                  min="-360"
                  max="360"
                  className="w-full p-1 border rounded"
                />
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Opacity (%)</label>
                <input
                  type="number"
                  value={Math.round((activeObject.opacity || 1) * 100)}
                  onChange={(e) => {
                    const opacity = parseInt(e.target.value) / 100;
                    activeObject.set({ opacity: opacity });
                    fabricRef.current.renderAll();
                    }}
                  min="0"
                  max="100"
                  className="w-full p-1 border rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainingDataManager;