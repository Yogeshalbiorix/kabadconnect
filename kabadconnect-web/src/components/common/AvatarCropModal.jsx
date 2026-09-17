import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Image as ImageIcon, 
  Camera, 
  RefreshCcw,
  Sparkles,
  Move
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80'
];

export const AvatarCropModal = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  title = 'Upload & Crop Profile Picture'
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize with current avatar if open
  useEffect(() => {
    if (isOpen) {
      setImageSrc(currentAvatar || PRESET_AVATARS[1]);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Selected image size exceeds 8MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Generate exact 400x400 pixel circular cropped image via HTML5 Canvas
  const handleGenerateCrop = async () => {
    if (!imageRef.current) return;
    setIsSaving(true);

    try {
      const canvas = document.createElement('canvas');
      const targetSize = 400; // 400x400 square / circle format
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        if (img.complete) resolve();
        img.onload = resolve;
        img.onerror = reject;
      });

      // Clear canvas with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetSize, targetSize);

      ctx.save();
      // Move to center of 400x400 canvas
      ctx.translate(targetSize / 2, targetSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Crop viewport display dimension is 280px, scale factor to 400px
      const displayViewportSize = 280;
      const scaleFactor = targetSize / displayViewportSize;

      ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

      // Position offset adjusted
      const drawX = position.x / zoom - (img.naturalWidth || img.width) / 2;
      const drawY = position.y / zoom - (img.naturalHeight || img.height) / 2;

      ctx.drawImage(img, drawX, drawY);
      ctx.restore();

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      if (onSaveAvatar) {
        await onSaveAvatar(croppedBase64);
      }
      onClose();
    } catch (err) {
      console.error('Failed to crop 400x400 avatar:', err);
      alert('Could not process avatar image. Please try another image file.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        padding: '1rem'
      }}
    >
      <div
        className="modal-content animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Camera size={20} color="var(--color-primary)" />
              <span>{title}</span>
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Drag to position & zoom for exact <strong>400 × 400</strong> circular profile resolution
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Interactive Circular Viewport */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'relative',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#0F172A',
              boxShadow: '0 0 0 6px #10B981, 0 12px 30px rgba(0,0,0,0.3)',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none'
            }}
          >
            {imageSrc ? (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  pointerEvents: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s ease'
                }}
              />
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8'
              }}>
                <ImageIcon size={48} />
                <span style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No Image Selected</span>
              </div>
            )}

            {/* Circular Overlay Guideline Grid */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.65)',
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
            }} />
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Move size={14} color="#10B981" />
            <span>Click & drag image inside circle to center your face</span>
          </div>

          {/* Controls: Zoom & Rotate */}
          <div style={{ width: '100%', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ZoomOut size={18} color="#64748B" />
              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer',
                  height: '6px'
                }}
              />
              <ZoomIn size={18} color="#64748B" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '42px', color: '#0F172A' }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={handleRotate}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCw size={14} /> Rotate 90°
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCcw size={14} /> Reset
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#2563EB', borderColor: '#BFDBFE' }}
              >
                <Upload size={14} /> Upload Device File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div style={{ width: '100%', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color="#F59E0B" />
              <span>Or Choose from Verified Preset Avatars:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {PRESET_AVATARS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Preset ${idx + 1}`}
                  onClick={() => {
                    setImageSrc(url);
                    setZoom(1);
                    setRotation(0);
                    setPosition({ x: 0, y: 0 });
                  }}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: imageSrc === url ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                    transform: imageSrc === url ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          background: '#F8FAFC',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerateCrop}
            disabled={isSaving || !imageSrc}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.35rem' }}
          >
            <Check size={16} />
            <span>{isSaving ? 'Processing 400×400 Crop...' : 'Save 400×400 Profile Photo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
