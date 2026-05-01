import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react'; // Ajout de l'icône Upload
import { categoriesAPI } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // State mis à jour pour gérer le fichier
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '', // Gardé pour l'image actuelle
    image_file: null, // Nouveau fichier sélectionné
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(null); // Aperçu du nouveau fichier

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || '',
        image_file: null,
      });
      setPreviewImage(null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        image_file: null,
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setPreviewImage(null);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, image_file: file });
      
      // Créer un aperçu local
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Préparation FormData pour l'envoi du fichier
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);

    // Gestion de l'image
    if (formData.image_file) {
      dataToSend.append('image', formData.image_file);
    }
    // Note: Pour l'update, si pas de nouveau fichier, le backend Python (app.py) 
    // récupère l'ancienne image automatiquement depuis la BDD.

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, dataToSend);
        showMessage('success', 'Catégorie mise à jour avec succès');
      } else {
        await categoriesAPI.create(dataToSend);
        showMessage('success', 'Catégorie créée avec succès');
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      showMessage('error', error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      showMessage('success', 'Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="admin-form-header">
        <h2>Gestion des Catégories</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={20} />
          Ajouter une catégorie
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} 
                    />
                  ) : (
                    <div style={{width: '50px', height: '50px', background: '#eee'}}></div>
                  )}
                </td>
                <td><strong>{category.name}</strong></td>
                <td>{category.description}</td>
                <td>
                  <div className="table-actions">
                    <button 
                      onClick={() => handleOpenModal(category)}
                      className="btn-icon"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="btn-icon btn-delete"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-header">
              <h2>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
              <button onClick={handleCloseModal} className="btn-icon">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="input-group">
                <label>Nom de la catégorie *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              {/* --- GESTION IMAGE FICHIER --- */}
              <div className="input-group">
                <label>Image de la catégorie</label>
                <div>
                  <input
                    type="file"
                    id="category-image-upload"
                    name="image_file"
                    onChange={handleChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="category-image-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    <Upload size={16} style={{ marginRight: '8px' }} /> Choisir un fichier
                  </label>
                  <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>
                    {formData.image_file ? formData.image_file.name : (editingCategory ? "Garder l'actuelle" : "Aucun fichier")}
                  </span>
                </div>

                {(previewImage || formData.image_url) && (
                  <div style={{ marginTop: '10px', padding: '10px', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center' }}>
                    <img 
                      src={previewImage || formData.image_url} 
                      alt="Aperçu" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  </div>
                )}
              </div>
              {/* ------------------------------- */}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;