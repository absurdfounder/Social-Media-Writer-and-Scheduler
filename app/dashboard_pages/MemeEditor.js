import React, { useState, useRef, useEffect } from 'react';
import { Building2, Users, MessageCircle, Brain, Menu, X, Twitter, ScanFace, 
  TrendingUp, Search, Bell, ChevronDown, Shapes, Book, Settings2, 
  DollarSign, Chrome, Handshake, Heart, Check, Calendar, CheckCircle2, Type,
  Move, Pencil, ArrowUpRight, Grid3X3, RotateCw, ZoomIn, ZoomOut, Download,
  Image as ImageIcon, ChevronUp, Trash2, Crop } from 'lucide-react';

// Predefined meme templates with hotspots
const MEME_LIBRARY = [
  {
    id: 1,
    name: "Drake Hotline Bling",
    url: "https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg",
    thumbnail: "https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg",
    hotspots: [
      {
        x: 350,
        y: 120,
        width: 300,
        height: 80,
        defaultText: "Using complex code",
        fontSize: 24,
        color: "#000000"
      },
      {
        x: 350,
        y: 320,
        width: 300,
        height: 80,
        defaultText: "Using ChatGPT",
        fontSize: 24,
        color: "#000000"
      }
    ]
  },
  {
    id: 2,
    name: "Two Buttons",
    url: "https://i.imgflip.com/2/9evc8h.jpg",
    thumbnail: "https://i.imgflip.com/2/9evc8h.jpg",
    hotspots: [
      {
        x: 120,
        y: 100,
        width: 140,
        height: 50,
        defaultText: "Button 1",
        fontSize: 20,
        color: "#000000"
      },
      {
        x: 300,
        y: 100,
        width: 140,
        height: 50,
        defaultText: "Button 2",
        fontSize: 20,
        color: "#000000"
      }
    ]
  },
  {
    id: 3,
    name: "Distracted Boyfriend",
    url: "https://imgflip.com/s/meme/Distracted-Boyfriend.jpg",
    thumbnail: "https://imgflip.com/s/meme/Distracted-Boyfriend.jpg",
    hotspots: [
      {
        x: 150,
        y: 100,
        width: 200,
        height: 60,
        defaultText: "New thing",
        fontSize: 24,
        color: "#FFFFFF"
      },
      {
        x: 350,
        y: 100,
        width: 200,
        height: 60,
        defaultText: "Me",
        fontSize: 24,
        color: "#FFFFFF"
      },
      {
        x: 550,
        y: 100,
        width: 200,
        height: 60,
        defaultText: "Current thing",
        fontSize: 24,
        color: "#FFFFFF"
      }
    ]
  }
];

const HANDLE_TYPES = {
  TOP_LEFT: 'topLeft',
  TOP_RIGHT: 'topRight',
  BOTTOM_RIGHT: 'bottomRight',
  BOTTOM_LEFT: 'bottomLeft',
  ROTATE: 'rotate'
};

const SHAPE_TYPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle'
};

function TrainingDataManager() {
  // Base state
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [tool, setTool] = useState('move');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const canvasRef = useRef(null);
  const [showMemeLibrary, setShowMemeLibrary] = useState(true);
  const textInputRef = useRef(null);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  // Transform controls state
  const [transforming, setTransforming] = useState(false);
  const [transformType, setTransformType] = useState(null);
  const [transformStart, setTransformStart] = useState(null);
  const [originalLayer, setOriginalLayer] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState(null);
  const [cropEnd, setCropEnd] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);

  // Constants
  const HANDLE_SIZE = 8;
  const ROTATE_HANDLE_OFFSET = 20;
  const MIN_SIZE = 20;

  useEffect(() => {
    drawCanvas();
  }, [layers, selectedLayer, isCropping, cropStart, cropEnd]);

  // Helper Functions
  const getCenter = (layer) => {
    const width = layer.width || (layer.type === 'text' ? 
      (layer.text ? layer.text.length * layer.fontSize * 0.6 : 100) : 100);
    const height = layer.type === 'text' ? layer.fontSize : (layer.height || 100);
    return {
      x: layer.x + width / 2,
      y: layer.y + height / 2
    };
  };

  const rotatePoint = (point, center, angle) => {
    const radians = (angle || 0) * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  };

  const isPointInHandle = (x, y, handle) => {
    return Math.abs(x - handle.x) <= HANDLE_SIZE &&
           Math.abs(y - handle.y) <= HANDLE_SIZE;
  };

  const getHandlePositions = (layer) => {
    if (!layer) return null;

    const width = layer.width || (layer.type === 'text' ? 
      (layer.text ? layer.text.length * layer.fontSize * 0.6 : 100) : 100);
    const height = layer.type === 'text' ? layer.fontSize : (layer.height || 100);
    const center = getCenter(layer);
    
    // Get corner points before rotation
    const corners = {
      [HANDLE_TYPES.TOP_LEFT]: { x: layer.x, y: layer.y },
      [HANDLE_TYPES.TOP_RIGHT]: { x: layer.x + width, y: layer.y },
      [HANDLE_TYPES.BOTTOM_RIGHT]: { x: layer.x + width, y: layer.y + height },
      [HANDLE_TYPES.BOTTOM_LEFT]: { x: layer.x, y: layer.y + height }
    };

    // Rotate all points
    const handles = {};
    Object.entries(corners).forEach(([key, point]) => {
      handles[key] = rotatePoint(point, center, layer.rotation);
    });

    // Add rotation handle
    handles[HANDLE_TYPES.ROTATE] = rotatePoint(
      { x: center.x, y: layer.y - ROTATE_HANDLE_OFFSET },
      center,
      layer.rotation
    );

    return handles;
  };

  const drawShape = (ctx, layer) => {
    const { x, y, width, height, shapeType, color, filled } = layer;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = layer.lineWidth || 2;
  
    switch (shapeType) {
      case SHAPE_TYPES.RECTANGLE:
        if (filled) {
          ctx.fillRect(x, y, width, height);
        } else {
          ctx.strokeRect(x, y, width, height);
        }
        break;
  
      case SHAPE_TYPES.CIRCLE:
        ctx.beginPath();
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          width / 2,
          height / 2,
          0,
          0,
          2 * Math.PI
        );
        if (filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
  
      case SHAPE_TYPES.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        if (filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
    }
  };

  const drawSelectionControls = (ctx, layer) => {
    if (!layer || selectedLayer === null) return;

    const handles = getHandlePositions(layer);
    const center = getCenter(layer);

    ctx.save();
    
    // Draw selection outline
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(handles[HANDLE_TYPES.TOP_LEFT].x, handles[HANDLE_TYPES.TOP_LEFT].y);
    ctx.lineTo(handles[HANDLE_TYPES.TOP_RIGHT].x, handles[HANDLE_TYPES.TOP_RIGHT].y);
    ctx.lineTo(handles[HANDLE_TYPES.BOTTOM_RIGHT].x, handles[HANDLE_TYPES.BOTTOM_RIGHT].y);
    ctx.lineTo(handles[HANDLE_TYPES.BOTTOM_LEFT].x, handles[HANDLE_TYPES.BOTTOM_LEFT].y);
    ctx.closePath();
    ctx.stroke();

    // Draw corner handles
    ctx.fillStyle = '#fff';
    Object.values(handles).forEach(handle => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, HANDLE_SIZE/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Draw rotation line and handle
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(handles[HANDLE_TYPES.ROTATE].x, handles[HANDLE_TYPES.ROTATE].y);
    ctx.stroke();

    ctx.restore();
  };

  const handleTransform = (e) => {
    if (!transforming || selectedLayer === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const layer = layers[selectedLayer];
    const center = getCenter(layer);
    const dx = x - transformStart.x;
    const dy = y - transformStart.y;

    if (transformType === HANDLE_TYPES.ROTATE) {
      const startAngle = Math.atan2(transformStart.y - center.y, transformStart.x - center.x);
      const currentAngle = Math.atan2(y - center.y, x - center.x);
      const rotation = ((currentAngle - startAngle) * 180 / Math.PI + originalLayer.rotation) % 360;
      
      setLayers(prev => prev.map((l, i) => 
        i === selectedLayer ? { ...l, rotation } : l
      ));
    } else if (transformType === 'move') {
      setLayers(prev => prev.map((l, i) => 
        i === selectedLayer ? {
          ...l,
          x: originalLayer.x + dx,
          y: originalLayer.y + dy
        } : l
      ));
    } else {
      // Improved resize logic with aspect ratio preservation
      const aspectRatio = originalLayer.width / originalLayer.height;
      let newWidth = originalLayer.width;
      let newHeight = originalLayer.height;
      let newX = originalLayer.x;
      let newY = originalLayer.y;

      if (transformType.includes('Right')) {
        newWidth = originalLayer.width + dx;
        newHeight = newWidth / aspectRatio;
      } else if (transformType.includes('Left')) {
        newWidth = originalLayer.width - dx;
        newHeight = newWidth / aspectRatio;
        newX = originalLayer.x + dx;
      }

      if (transformType.includes('Bottom')) {
        newHeight = originalLayer.height + dy;
        newWidth = newHeight * aspectRatio;
      } else if (transformType.includes('Top')) {
        newHeight = originalLayer.height - dy;
        newWidth = newHeight * aspectRatio;
        newY = originalLayer.y + dy;
      }

      // Ensure minimum size
      if (newWidth < MIN_SIZE) {
        newWidth = MIN_SIZE;
        newHeight = newWidth / aspectRatio;
      }
      if (newHeight < MIN_SIZE) {
        newHeight = MIN_SIZE;
        newWidth = newHeight * aspectRatio;
      }

      setLayers(prev => prev.map((l, i) => 
        i === selectedLayer ? {
          ...l,
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY
        } : l
      ));
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLastPoint({ x, y });

    if (isCropping) {
      setCropStart({ x, y });
      setCropEnd({ x, y });
      return;
    }

    if (tool === 'move' && selectedLayer !== null) {
      const layer = layers[selectedLayer];
      const handles = getHandlePositions(layer);

      // Check for handle interactions
      for (const [type, handle] of Object.entries(handles)) {
        if (isPointInHandle(x, y, handle)) {
          setTransforming(true);
          setTransformType(type);
          setTransformStart({ x, y });
          setOriginalLayer({ ...layer });
          return;
        }
      }

      // Check for layer selection/dragging
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (layer.visible && isPointInLayer(x, y, layer)) {
          setSelectedLayer(i);
          setTransforming(true);
          setTransformType('move');
          setTransformStart({ x, y });
          setOriginalLayer({ ...layer });
          return;
        }
      }

      setSelectedLayer(null);
    } else if (tool === 'pen') {
      setIsDrawing(true);
      const newLayer = {
        type: 'drawing',
        points: [{ x, y }],
        color,
        lineWidth,
        visible: true,
        name: 'Drawing'
      };
      setLayers(prev => [...prev, newLayer]);
      setSelectedLayer(layers.length);
    } else if (tool === 'arrow') {
      setIsDrawing(true);
      const newLayer = {
        type: 'arrow',
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color,
        lineWidth,
        visible: true,
        name: 'Arrow'
      };
      setLayers(prev => [...prev, newLayer]);
      setSelectedLayer(layers.length);
    } else if (tool.startsWith('shape_')) {
      setIsDrawing(true);
      const shapeType = tool.replace('shape_', '');
      const newLayer = {
        type: 'shape',
        shapeType,
        x,
        y,
        width: 0,
        height: 0,
        color,
        lineWidth,
        filled: isFilled,
        visible: true,
        name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`
      };
      setLayers(prev => [...prev, newLayer]);
      setSelectedLayer(layers.length);
    }
  };

  const handleMouseMove = (e) => {
    if (!transforming && !isDrawing && !isCropping) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isCropping && cropStart) {
      setCropEnd({ x, y });
      return;
    }

    if (transforming && selectedLayer !== null) {
      handleTransform(e);
    } else if (isDrawing && selectedLayer !== null) {
      if (tool === 'pen') {
        setLayers(prev => prev.map((layer, index) =>
          index === selectedLayer
            ? { ...layer, points: [...layer.points, { x, y }] }
            : layer
        ));
      } else if (tool === 'arrow') {
        setLayers(prev => prev.map((layer, index) =>
          index === selectedLayer
            ? { ...layer, endX: x, endY: y }
            : layer
        ));
      } else if (tool.startsWith('shape_')) {
        setLayers(prev => prev.map((layer, index) =>
          index === selectedLayer
            ? {
                ...layer,
                width: Math.abs(x - layer.x),
                height: Math.abs(y - layer.y)
              }
            : layer
        ));
      }
    }

    setLastPoint({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setTransforming(false);
    setTransformType(null);
    setTransformStart(null);
    setOriginalLayer(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const newLayer = {
              type: 'image',
              src: event.target.result,
              x: 50,
              y: 50,
              width: img.width,
              height: img.height,
              rotation: 0,
              visible: true,
              name: file.name
            };
            setLayers(prev => [...prev, newLayer]);
            setSelectedLayer(layers.length);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCrop = () => {
    if (!selectedLayer) return;
    
    const layer = layers[selectedLayer];
    if (layer.type !== 'image') return;

    if (!isCropping) {
      setIsCropping(true);
      setCropStart(null);
      setCropEnd(null);
    } else if (cropStart && cropEnd) {
      // Apply crop
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const cropWidth = Math.abs(cropEnd.x - cropStart.x);
        const cropHeight = Math.abs(cropEnd.y - cropStart.y);
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.drawImage(
          img,
          Math.min(cropStart.x, cropEnd.x),
          Math.min(cropStart.y, cropEnd.y),
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );
        
        const croppedImage = canvas.toDataURL();
        
        setLayers(prev => prev.map((l, i) =>
          i === selectedLayer ? {
            ...l,
            src: croppedImage,
            width: cropWidth,
            height: cropHeight
          } : l
        ));
      };
      
      img.src = layer.src;
      
      setIsCropping(false);
      setCropStart(null);
      setCropEnd(null);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (layers.some(layer => layer.type === 'grid' && layer.visible)) {
      drawGrid(ctx);
    }

    // Draw all visible layers
    layers.filter(layer => layer.visible).forEach((layer, index) => {
      ctx.save();
      
      const center = getCenter(layer);
      
      // Apply transformations
      if (layer.rotation) {
        ctx.translate(center.x, center.y);
        ctx.rotate(layer.rotation * Math.PI / 180);
        ctx.translate(-center.x, -center.y);
      }

      switch (layer.type) {
        case 'image':
          if (layer.src) {
            const img = new window.Image();
            img.src = layer.src;
            if (img.complete) {
              ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
            } else {
              img.onload = () => {
                ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
                if (selectedLayer === index) {
                  drawSelectionControls(ctx, layer);
                }
              };
            }
          }
          break;

        case 'text':
          if (!isEditingText || selectedLayer !== index) {
            ctx.font = `${layer.fontSize}px ${layer.fontFamily || 'Arial'}`;
            ctx.fillStyle = layer.color;
            ctx.fillText(layer.text, layer.x, layer.y + layer.fontSize);
          }
          break;

        case 'drawing':
          if (layer.points?.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = layer.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(layer.points[0].x, layer.points[0].y);
            layer.points.forEach((point, i) => {
              if (i > 0) ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;

        case 'arrow':
          drawArrow(ctx, layer);
          break;

        case 'shape':
          drawShape(ctx, layer);
          break;
      }

      ctx.restore();

      // Draw selection controls if layer is selected
      if (selectedLayer === index) {
        drawSelectionControls(ctx, layer);
      }
    });

    // Draw crop overlay
    if (isCropping && cropStart && cropEnd) {
      ctx.save();
      ctx.strokeStyle = '#00f';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const width = cropEnd.x - cropStart.x;
      const height = cropEnd.y - cropStart.y;
      
      ctx.strokeRect(cropStart.x, cropStart.y, width, height);
      
      // Draw semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, cropStart.y); // Top
      ctx.fillRect(0, cropEnd.y, canvas.width, canvas.height - cropEnd.y); // Bottom
      ctx.fillRect(0, cropStart.y, cropStart.x, height); // Left
      ctx.fillRect(cropEnd.x, cropStart.y, canvas.width - cropEnd.x, height); // Right
      
      ctx.restore();
    }
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    const gridSize = 20;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawArrow = (ctx, layer) => {
    const { startX, startY, endX, endY, color, lineWidth } = layer;
    const headLength = 15;
    const angle = Math.atan2(endY - startY, endX - startX);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI/6),
      endY - headLength * Math.sin(angle - Math.PI/6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI/6),
      endY - headLength * Math.sin(angle + Math.PI/6)
    );
    ctx.stroke();
  };

  const isPointInLayer = (x, y, layer) => {
    if (layer.type === 'image' || layer.type === 'text') {
      const center = getCenter(layer);
      const width = layer.width || (layer.type === 'text' ? 
        (layer.text ? layer.text.length * layer.fontSize * 0.6 : 100) : 100);
      const height = layer.type === 'text' ? layer.fontSize : (layer.height || 100);
      
      // Transform point back by rotation
      const rotatedPoint = rotatePoint(
        { x, y },
        center,
        -layer.rotation
      );

      return rotatedPoint.x >= layer.x &&
             rotatedPoint.x <= layer.x + width &&
             rotatedPoint.y >= layer.y &&
             rotatedPoint.y <= layer.y + height;
    }
    return false;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const newLayer = {
            type: 'image',
            src: e.target.result,
            x: 50,
            y: 50,
            width: img.width,
            height: img.height,
            rotation: 0,
            visible: true,
            name: file.name
          };
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayer(layers.length);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoubleClick = (e) => {
    if (tool === 'text' || (selectedLayer !== null && layers[selectedLayer].type === 'text')) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (selectedLayer === null) {
        // Create new text layer
        const newLayer = {
          type: 'text',
          text: '',
          x,
          y,
          fontSize,
          fontFamily: 'Arial',
          color,
          rotation: 0,
          visible: true,
          name: 'Text Layer'
        };
        setLayers(prev => [...prev, newLayer]);
        setSelectedLayer(layers.length);
      }
      
      setIsEditingText(true);
    }
  };

  const addText = () => {
    const newLayer = {
      type: 'text',
      text: 'Double click to edit',
      x: 100,
      y: 100,
      fontSize: fontSize,
      fontFamily: 'Arial',
      color: color,
      rotation: 0,
      visible: true,
      name: 'Text Layer'
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(layers.length);
  };

  const addMemeFromLibrary = (meme) => {
    const img = new window.Image();
    img.onload = () => {
      // Add the base image layer
      const imageLayers = [{
        type: 'image',
        src: meme.url,
        x: 50,
        y: 50,
        width: img.width || 300,
        height: img.height || 300,
        rotation: 0,
        visible: true,
        name: meme.name
      }];
      
      // Add text layers for each hotspot
      if (meme.hotspots) {
        const textLayers = meme.hotspots.map(hotspot => ({
          type: 'text',
          text: hotspot.defaultText,
          x: hotspot.x,
          y: hotspot.y,
          fontSize: hotspot.fontSize || 24,
          fontFamily: 'Arial',
          color: hotspot.color || '#000000',
          rotation: 0,
          visible: true,
          name: `${meme.name} Text`
        }));
        
        setLayers(prev => [...prev, ...imageLayers, ...textLayers]);
        setSelectedLayer(layers.length);
      } else {
        setLayers(prev => [...prev, ...imageLayers]);
        setSelectedLayer(layers.length);
      }
    };
    img.src = meme.url;
  };

  const toggleGrid = () => {
    const gridLayer = layers.find(layer => layer.type === 'grid');
    if (gridLayer) {
      setLayers(prev => prev.map(layer => 
        layer.type === 'grid' ? {...layer, visible: !layer.visible} : layer
      ));
    } else {
      setLayers(prev => [...prev, {
        type: 'grid',
        visible: true,
        name: 'Grid'
      }]);
    }
  };

  const toggleLayerVisibility = (index) => {
    setLayers(prev => prev.map((layer, i) =>
      i === index ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const moveLayer = (index, direction) => {
    if (index === null) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= layers.length) return;

    setLayers(prev => {
      const newLayers = [...prev];
      const temp = newLayers[index];
      newLayers[index] = newLayers[newIndex];
      newLayers[newIndex] = temp;
      return newLayers;
    });
    setSelectedLayer(newIndex);
  };

  const deleteLayer = (index) => {
    if (index !== null && index >= 0 && index < layers.length) {
      setLayers(prev => prev.filter((_, i) => i !== index));
      setSelectedLayer(null);
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Text input overlay component
  const TextInputOverlay = () => {
    if (!isEditingText || selectedLayer === null || layers[selectedLayer].type !== 'text') {
      return null;
    }

    const layer = layers[selectedLayer];
    const style = {
      position: 'absolute',
      left: `${layer.x}px`,
      top: `${layer.y}px`,
      transform: `rotate(${layer.rotation}deg)`,
      fontSize: `${layer.fontSize}px`,
      fontFamily: layer.fontFamily,
      color: layer.color,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: 0,
      margin: 0,
      width: 'auto',
      minWidth: '100px'
    };

    return (
      <input
        ref={textInputRef}
        type="text"
        value={layer.text}
        onChange={(e) => {
          setLayers(prev => prev.map((l, i) =>
            i === selectedLayer ? { ...l, text: e.target.value } : l
          ));
        }}
        onBlur={() => setIsEditingText(false)}
        style={style}
        autoFocus
      />
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        {/* Toggle buttons */}
        <div className="flex mb-4 gap-2">
          <button
            className={`flex-1 p-2 rounded ${showMemeLibrary ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setShowMemeLibrary(true)}
          >
            Library
          </button>
          <button
            className={`flex-1 p-2 rounded ${!showMemeLibrary ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setShowMemeLibrary(false)}
          >
            Layers
          </button>
        </div>

        {showMemeLibrary ? (
          <div className="space-y-2">
            <h3 className="font-bold mb-2">Meme Templates</h3>
            {MEME_LIBRARY.map((meme) => (
              <div
                key={meme.id}
                className="p-2 bg-white rounded cursor-pointer hover:bg-gray-50"
                onClick={() => addMemeFromLibrary(meme)}
              >
                <img
                  src={meme.thumbnail}
                  alt={meme.name}
                  className="w-full h-24 object-cover mb-1 rounded"
                />
                <p className="text-sm">{meme.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-bold mb-2">Layers</h3>
            {layers.map((layer, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded ${
                  selectedLayer === index ? 'bg-blue-100' : 'bg-white'
                }`}
                onClick={() => setSelectedLayer(index)}
              >
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => toggleLayerVisibility(index)}
                  className="mr-2"
                />
                <span className="flex-1 truncate">{layer.name || `Layer ${index + 1}`}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(index, -1);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(index, 1);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex gap-2 p-4 bg-gray-100">
          <button
            className={`p-2 rounded ${tool === 'move' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('move')}
            title="Move Tool (V)"
          >
            <Move size={20} />
          </button>

          {/* Shape Tools Dropdown */}
          <div className="relative">
            <button
              className={`p-2 rounded ${
                tool.startsWith('shape_') ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
              onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
              title="Shape Tools"
            >
              <Shapes size={20} />
            </button>
            {shapeMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg p-2 z-10">
                <button
                  className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  onClick={() => {
                    setTool('shape_rectangle');
                    setShapeMenuOpen(false);
                  }}
                >
                  <span className="w-5 h-5 border-2 border-black inline-block"></span>
                  Rectangle
                </button>
                <button
                  className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  onClick={() => {
                    setTool('shape_circle');
                    setShapeMenuOpen(false);
                  }}
                >
                  <span className="w-5 h-5 border-2 border-black rounded-full inline-block"></span>
                  Circle
                </button>
                <button
                  className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  onClick={() => {
                    setTool('shape_triangle');
                    setShapeMenuOpen(false);
                  }}
                >
                  <span className="w-5 h-5 border-2 border-black inline-block"
                        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></span>
                  Triangle
                </button>
                <div className="border-t my-2"></div>
                <label className="flex items-center gap-2 p-2">
                  <input
                    type="checkbox"
                    checked={isFilled}
                    onChange={(e) => setIsFilled(e.target.checked)}
                  />
                  Filled Shape
                </label>
              </div>
            )}
          </div>

          <label className="p-2 rounded bg-white cursor-pointer" title="Upload Image">
            <ImageIcon size={20} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>

          <button
            className={`p-2 rounded ${tool === 'text' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => {
              setTool('text');
              addText();
            }}
            title="Add Text (T)"
          >
            <Type size={20} />
          </button>

          <button
            className={`p-2 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('pen')}
            title="Pen Tool (P)"
          >
            <Pencil size={20} />
          </button>

          <button
            className={`p-2 rounded ${tool === 'arrow' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setTool('arrow')}
            title="Arrow Tool (A)"
          >
            <ArrowUpRight size={20} />
          </button>

          <button
            className={`p-2 rounded ${isCropping ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={handleCrop}
            title="Crop Tool (C)"
          >
            <Crop size={20} />
          </button>

          <button
            className="p-2 rounded bg-white"
            onClick={toggleGrid}
            title="Toggle Grid (G)"
          >
            <Grid3X3 size={20} />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-1 rounded bg-white cursor-pointer"
            title="Color Picker"
          />

          <input
            type="number"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
            min="1"
            max="20"
            className="w-16 p-1 rounded"
            title="Line Width"
          />

          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            min="8"
            max="72"
            className="w-16 p-1 rounded"
            title="Font Size"
          />

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <button
            className="p-2 rounded bg-green-500 text-white"
            onClick={exportImage}
            title="Export Image"
          >
            <Download size={20} />
          </button>
        </div>

        {/* Canvas Container */}
        <div 
          className="relative flex-1 p-4 flex items-center justify-center bg-gray-200"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300 bg-white shadow-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
          <TextInputOverlay />
        </div>

        {/* Properties Panel */}
        {selectedLayer !== null && layers[selectedLayer] && (
          <div className="bg-gray-100 p-4">
            <h3 className="font-bold mb-2">Layer Properties</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-20">Name:</label>
                <input
                  type="text"
                  value={layers[selectedLayer].name || `Layer ${selectedLayer + 1}`}
                  onChange={(e) => {
                    setLayers(prev => prev.map((layer, index) =>
                      index === selectedLayer ? { ...layer, name: e.target.value } : layer
                    ));
                  }}
                  className="flex-1 p-1 rounded border"
                />
              </div>
              {layers[selectedLayer].type === 'text' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="w-20">Font:</label>
                    <select
                      value={layers[selectedLayer].fontFamily || 'Arial'}
                      onChange={(e) => {
                        setLayers(prev => prev.map((layer, index) =>
                          index === selectedLayer ? { ...layer, fontFamily: e.target.value } : layer
                        ));
                      }}
                      className="flex-1 p-1 rounded border"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-20">Size:</label>
                    <input
                      type="number"
                      value={layers[selectedLayer].fontSize}
                      onChange={(e) => {
                        setLayers(prev => prev.map((layer, index) =>
                          index === selectedLayer ? { ...layer, fontSize: parseInt(e.target.value, 10) } : layer
                        ));
                      }}
                      min="8"
                      max="72"
                      className="flex-1 p-1 rounded border"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <label className="w-20">Opacity:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(layers[selectedLayer].opacity || 1) * 100}
                  onChange={(e) => {
                    setLayers(prev => prev.map((layer, index) =>
                      index === selectedLayer ? { ...layer, opacity: parseInt(e.target.value, 10) / 100 } : layer
                    ));
                  }}
                  className="flex-1"
                />
              </div>
              {layers[selectedLayer].type === 'shape' && (
                <div className="flex items-center gap-2">
                  <label className="w-20">Filled:</label>
                  <input
                    type="checkbox"
                    checked={layers[selectedLayer].filled}
                    onChange={(e) => {
                      setLayers(prev => prev.map((layer, index) =>
                        index === selectedLayer ? { ...layer, filled: e.target.checked } : layer
                      ));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainingDataManager;