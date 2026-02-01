import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function LandingPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/links`);
      setLinks(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(link => link.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (id, url) => {
    try {
      // Track click
      await axios.patch(`${API_BASE}/links/${id}/click`);
      // Open affiliate link in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="landing-page">
      <header className="hero">
        <h1>Affiliate Links Directory</h1>
        <p>Discover amazing products and services</p>
      </header>

      <main className="container">
        {categories.map(category => (
          <section key={category} className="category-section">
            <h2>{category}</h2>
            <div className="links-grid">
              {links
                .filter(link => link.category === category)
                .map(link => (
                  <div key={link._id} className="link-card">
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                    <button 
                      onClick={() => handleLinkClick(link._id, link.url)}
                      className="affiliate-button"
                    >
                      Visit Link
                    </button>
                    {link.tags && (
                      <div className="tags">
                        {link.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Affiliate Directory</p>
      </footer>
    </div>
  );
}

export default LandingPage;
