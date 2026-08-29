import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Image as ImageIcon, Save, Tag, Clock, Upload, Sparkles, Check } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Preset Roblox Image Gallery for 1-click selection
const PRESET_GALLERY = [
  {
    name: 'Guadaña Harvester / Hielo',
    category: 'Armas Virtuales',
    url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Cuchillo Icewing MM2',
    category: 'Armas Virtuales',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Chroma Elderwood RGB',
    category: 'Armas Virtuales',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Espada Neón Blade Ball',
    category: 'Armas Virtuales',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Moneda / Robux Monedas',
    category: 'Robux',
    url: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Bonus Robux Tarjeta',
    category: 'Robux',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Super Pack 10k Robux',
    category: 'Robux',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Fruta Kitsune Blox Fruits',
    category: 'Combos & pases',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'
  }
];

export default function ProductFormModal({ product, isOpen, onClose, onSaved }) {
  const { showToast } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Armas Virtuales');
  const [subcategory, setSubcategory] = useState('Murder Mystery 2');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [badge, setBadge] = useState('Godly');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Entrega por Tradeo (2-5 min)');
  const [imageSourceMode, setImageSourceMode] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setCategory(product.category || 'Armas Virtuales');
      setSubcategory(product.subcategory || '');
      setPrice(product.price !== undefined ? product.price : '');
      setStock(product.stock !== undefined ? product.stock : '');
      setBadge(product.badge || '');
      setImageUrl(product.imageUrl || '');
      setDescription(product.description || '');
      setDeliveryTime(product.deliveryTime || 'Entrega por Tradeo (2-5 min)');
    } else {
      setTitle('');
      setCategory('Armas Virtuales');
      setSubcategory('Murder Mystery 2');
      setPrice('14.99');
      setStock('50');
      setBadge('Godly');
      setImageUrl(PRESET_GALLERY[1].url);
      setDescription('');
      setDeliveryTime('Entrega por Tradeo (2-5 min)');
    }
    setPreviewError(false);
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Handle Local File Upload from PC with Automatic Compression
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Selecciona un archivo de imagen válido (.png, .jpg, .webp)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using HTML Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrl(compressedDataUrl);
        setPreviewError(false);
        showToast('¡Imagen optimizada y cargada desde tu equipo!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalImage = (imageUrl && imageUrl.trim()) ? imageUrl.trim() : PRESET_GALLERY[0].url;
      const payload = {
        title,
        category,
        subcategory,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        badge,
        imageUrl: finalImage,
        description,
        deliveryTime
      };

      if (product) {
        const res = await apiService.updateProduct(product.id, payload);
        if (res.success) {
          showToast(res.message || 'Producto actualizado con éxito.');
          onSaved();
          onClose();
        }
      } else {
        const res = await apiService.createProduct(payload);
        if (res.success) {
          showToast(res.message || '¡Producto creado exitosamente!');
          onSaved();
          onClose();
        }
      }
    } catch (err) {
      showToast(err.message || 'Error al guardar el producto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '620px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <button
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000'
          }}>
            <Package size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>
              {product ? 'Editar Producto / Arma Virtual' : 'Añadir Nuevo Producto al Catálogo'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sube la imagen de tu computadora o selecciona una de la galería rápida.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Título del Producto / Arma:
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: Guadaña Icewing MM2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* EASY IMAGE SELECTOR CONTAINER */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#FFF', marginBottom: '0.75rem' }}>
              🖼️ Selección de Imagen para el Producto:
            </label>

            {/* Mode Switch Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setImageSourceMode('upload')}
                className={`btn btn-sm ${imageSourceMode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', gap: '0.3rem' }}
              >
                <Upload size={14} /> Subir de la PC
              </button>

              <button
                type="button"
                onClick={() => setImageSourceMode('presets')}
                className={`btn btn-sm ${imageSourceMode === 'presets' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', gap: '0.3rem' }}
              >
                <Sparkles size={14} /> Galería Roblox
              </button>

              <button
                type="button"
                onClick={() => setImageSourceMode('url')}
                className={`btn btn-sm ${imageSourceMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', gap: '0.3rem' }}
              >
                <ImageIcon size={14} /> Link / URL Directa
              </button>
            </div>

            {/* OPTION 1: FILE UPLOAD FROM PC */}
            {imageSourceMode === 'upload' && (
              <div>
                <label 
                  htmlFor="file-upload-input"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.75rem 1rem',
                    border: '2px dashed var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 242, 254, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Upload size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF' }}>
                    Haz Clic Aquí para Seleccionar Foto de tu Computadora
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Soporta imágenes JPG, PNG, WEBP (Se optimizan automáticamente)
                  </span>
                </label>
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {/* OPTION 2: ONE-CLICK PRESET GALLERY */}
            {imageSourceMode === 'presets' && (
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Haz clic en cualquiera de estas fotos oficiales para asignarla al producto:
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '0.5rem',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  paddingRight: '0.3rem'
                }}>
                  {PRESET_GALLERY.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setImageUrl(item.url);
                        setPreviewError(false);
                      }}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: imageUrl === item.url ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        height: '75px',
                        background: '#000'
                      }}
                    >
                      <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {imageUrl === item.url && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--primary)', color: '#000', borderRadius: '50%', padding: '2px' }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OPTION 3: DIRECT URL */}
            {imageSourceMode === 'url' && (
              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  Introduce el enlace directo a la imagen.
                </p>
              </div>
            )}

            {/* LIVE PREVIEW BOX */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                <img
                  src={imageUrl || PRESET_GALLERY[0].url}
                  alt="Vista previa"
                  onError={() => setPreviewError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: previewError ? 'var(--warning)' : 'var(--primary)' }}>
                  {previewError ? '⚠️ Imagen sin vista previa (usará respaldo)' : '✓ Foto Seleccionada Lista'}
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  Vista previa de cómo aparecerá la portada en la tienda.
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Categoría Principal:
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ background: '#0F1424' }}
              >
                <option value="Armas Virtuales">Armas Virtuales</option>
                <option value="Robux">Robux</option>
                <option value="Combos & pases">Combos & pases</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Subcategoría / Juego:
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: Murder Mystery 2, Blox Fruits"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Precio ($ USD):
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="14.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Stock Disponible:
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Badge / Rarity (Tipo de Arma):
              </label>

              {/* Selector Rápido: Ancient, Chroma, Godly */}
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                {['Ancient', 'Chroma', 'Godly', 'Popular', 'Nuevo'].map(rarity => (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => setBadge(rarity)}
                    className={`btn btn-sm ${badge === rarity ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '12px' }}
                  >
                    {rarity}
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="input-field"
                placeholder="Selecciona arriba o escribe (ej: Ancient, Chroma, Godly)..."
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Tiempo Estimado de Entrega:
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Entrega por Tradeo (2-5 min)"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Descripción Breve:
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Descripción de la guadaña o arma virtual..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <Save size={18} />
            {loading ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </form>

      </div>
    </div>
  );
}
