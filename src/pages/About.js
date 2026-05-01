import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import image from './salon.jpg';
import logo from './image.png';
const About = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
      <div className="container">
        <div className="section-header" style={{textAlign: 'center', marginBottom: '40px'}}>
          <h1>Qui Sommes Nous ?</h1>
          <p>L'artisanat tunisien à votre service</p>
        </div>

        <div className="about-content">
            <img src={logo}/>
          <div className="about-text">
            <h3>Notre Histoire</h3>
            <p>
              Bienvenue chez <strong>Meuble Ben Youssef</strong>. Depuis notre création EN 2022, 
              nous nous sommes engagés à offrir des meubles de haute qualité qui allient 
              tradition artisanale et design moderne. Chaque pièce que nous proposons 
              est sélectionnée avec soin pour transformer votre intérieur en un espace 
              de vie unique et confortable.
            </p>
            <br />
            <h3>Nos Valeurs</h3>
            <ul>
              <li>✅ <strong>Qualité :</strong> Des matériaux durables et robustes.</li>
              <li>✅ <strong>Design :</strong> Des lignes élégantes adaptées à tous les goûts.</li>
              <li>✅ <strong>Service :</strong> Une équipe dédiée à votre satisfaction.</li>
            </ul>
            <br />
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Découvrir nos collections <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="about-image">
            <img 
              src={image} 
              alt="Atelier de meuble" 
              style={{ width: '100%', borderRadius: '10px' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;