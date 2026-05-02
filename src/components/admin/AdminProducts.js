import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    // On retire image_url/image_file simple pour gérer un tableau d'images
    image_files: [], // Tableau de fichiers
    dimensions: '',
    material: '',
    color: '',
    weight: '',
    is_featured: false,
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [previews, setPreviews] = useState([]); // Aperçu des nouvelles images

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setMessage({ type: 'error', text: 'Erreur chargement' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        image_files: [], // On vide les fichiers à l'ouverture
        dimensions: product.dimensions || '',
        material: product.material || '',
        color: product.color || '',
        weight: product.weight || '',
        is_featured: product.is_featured,
      });
      setPreviews([]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', price: '', stock_quantity: '', category_id: '',
        image_files: [], dimensions: '', material: '', color: '', weight: '', is_featured: false,
      });
      setPreviews([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setPreviews([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      // Gestion des fichiers multiples
      const selectedFiles = Array.from(files);
      setFormData({ ...formData, image_files: selectedFiles });
      
      // Créer des URLs d'aperçu
      const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(previewUrls);
    } else {
      const val = type === 'checkbox' ? checked : value;
      setFormData({ ...formData, [name]: val });
    }
  };

  const handleRemovePreview = (index) => {
    const newFiles = formData.image_files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFormData({ ...formData, image_files: newFiles });
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Préparation des données
    const dataToSend = new FormData();

    // Ajout des champs texte
    Object.keys(formData).forEach(key => {
      if (key !== 'image_files' && key !== 'image_url') {
        dataToSend.append(key, formData[key]);
      }
    });

    // Gestion des images multiples
    // Clé = 'images' (au pluriel) car le backend attend un tableau
    if (formData.image_files && formData.image_files.length > 0) {
      formData.image_files.forEach(file => {
        dataToSend.append('images', file);
      });
    }

    try {
      // --- IMPORTANT CORRECTION ---
      // NE PAS METTRE de headers Content-Type manuels ici !
      // Axios détecte automatiquement FormData et définit le bon 'boundary'
      await productsAPI.create(dataToSend); 
      // -----------------------------
      
      showMessage('success', 'Produit créé avec images');
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Erreur détaillée:", error.response?.data || error);
      showMessage('error', error.response?.data?.detail || "Erreur enregistrement");
    }
  };

  // Même correction pour l'update si tu veux permettre l'update d'images
  const handleUpdate = async (id) => {
    // ... logique similaire à handleSubmit mais pour update ...
    // Pour simplifier ici, on réutilise handleSubmit pour le CREATE, 
    // tu peux adapter handleUpdate de la même façon.
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    try {
      await productsAPI.delete(id);
      showMessage('success', 'Produit supprimé');
      fetchData();
    } catch (error) {
      showMessage('error', 'Erreur suppression');
    }
  };

  // Helper pour afficher la première image
  const getDisplayImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    return product.image_url;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="admin-products">
      <div className="admin-form-header">
        <h2>Gestion des Produits</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={20} /> Ajouter
        </button>
      </div>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {getDisplayImage(product) ? (
                    <img src={getDisplayImage(product)} alt={product.name} style={{width: '50px', height:'50px', objectFit:'cover'}} />
                  ) : <div style={{width:'50px', height:'50px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px'}}>No Img</div>}
                </td>
                <td>{product.name}</td>
                <td>{product.category_name || 'ID: ' + product.category_id}</td>
                <td>{product.price} TND </td>
                <td>
                  <button onClick={() => handleOpenModal(product)} className="btn-icon"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(product.id)} className="btn-icon btn-delete"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '800px', width: '90%'}}>
            <div className="admin-form-header">
              <h2>{editingProduct ? 'Modifier' : 'Nouveau produit'}</h2>
              <button onClick={handleCloseModal} className="btn-icon"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="input-group">
                <label>Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              
              <div className="input-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Prix</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
                </div>
                <div className="input-group">
                  <label>Stock</label>
                  <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-group">
                <label>Catégorie</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                  <option value="">Choisir une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* GESTION IMAGES MULTIPLES */}
              <div className="input-group">
                <label>Images (Plusieurs possibles)</label>
                <input 
                  type="file" 
                  name="image_files" 
                  onChange={handleChange} 
                  accept="image/*" 
                  multiple 
                />
                
                {/* Aperçu */}
                {previews.length > 0 && (
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '10px'}}>
                    {previews.map((src, idx) => (
                      <div key={idx} style={{position: 'relative'}}>
                        <img src={src} alt={`Preview ${idx}`} style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px'}} />
                        <button 
                          type="button"
                          onClick={() => handleRemovePreview(idx)}
                          style={{
                            position: 'absolute', top: '-5px', right: '-5px', 
                            background: '#ff4d4d', color: 'white', border: 'none', 
                            borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px'
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="input-group"><label>Dimensions</label><input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} /></div>
                <div className="input-group"><label>Poids</label><input type="text" name="weight" value={formData.weight} onChange={handleChange} /></div>
              </div>
              
              <div className="input-group" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} style={{width:'auto'}} />
                <label style={{margin:0}}>Produit en vedette</label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Enregistrer</button>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;