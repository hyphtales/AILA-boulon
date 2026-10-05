import React, { useState, useEffect } from 'react';
import { genererCode, MODELES } from './services/ai';

// On utilise la clé directement dans ai.js, plus besoin de la chercher ici
export default function App() {
  const [demande, setDemande] = useState("");
  const [code, setCode] = useState("");
  const [modeleSelectionne, setModeleSelectionne] = useState(MODELES[0].id);
  const [chargement, setChargement] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [statut, setStatut] = useState("");

  useEffect(() => {
    const sauvegarde = localStorage.getItem('bolt-historique');
    if (sauvegarde) setHistorique(JSON.parse(sauvegarde));
  }, []);

  const ajouterHistorique = (nom, codeGenere) => {
    const nouvelItem = {
      id: Date.now(),
      nom,
      code: codeGenere,
      date: new Date().toLocaleString('fr-FR')
    };
    const nouveau = [nouvelItem, ...historique].slice(0, 20);
    setHistorique(nouveau);
    localStorage.setItem('bolt-historique', JSON.stringify(nouveau));
  };

  async function creer() {
    if (!demande.trim()) return alert("Écris ce que tu veux créer !");
    
    setChargement(true);
    setStatut("Génération du code...");
    
    try {
      const codeGenere = await genererCode(demande, modeleSelectionne);
      setCode(codeGenere);
      ajouterHistorique(demande.slice(0, 40) + "...", codeGenere);
      setStatut("✅ Prêt !");
    } catch (err) {
      setStatut("❌ " + err.message);
      alert("Erreur : " + err.message);
    }
    
    setChargement(false);
  }

  function telecharger() {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "mon-projet.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copier() {
    navigator.clipboard.writeText(code);
    setStatut("📋 Copié !");
    setTimeout(() => setStatut(""), 2000);
  }

  function chargerProjet(item) {
    setDemande(item.nom.replace("...", ""));
    setCode(item.code);
  }

  return (
    <>
      <header>
        <div className="brand">
          <h1>⚡ Mon Bolt Sans Défaut</h1>
          <span className="badge">GRATUIT</span>
        </div>
        <div className="top-controls">
          <select
            value={modeleSelectionne}
            onChange={(e) => setModeleSelectionne(e.target.value)}
          >
            {MODELES.map(m => (
              <option key={m.id} value={m.id}>
                {m.nom} {m.gratuit ? "🆓" : ""}
              </option>
            ))}
          </select>
          <button className="btn-secondary" onClick={telecharger} disabled={!code}>
            📥 Télécharger
          </button>
          <button className="btn-secondary" onClick={copier} disabled={!code}>
            📋 Copier
          </button>
        </div>
      </header>

      <main>
        <section className="panel panel-left">
          <h3>💡 Quoi construire ?</h3>
          <textarea
            value={demande}
            onChange={(e) => setDemande(e.target.value)}
            placeholder="Ex: Un portfolio moderne avec animations..."
            disabled={chargement}
          />
          <button
            className="btn-primary"
            onClick={creer}
            disabled={chargement}
            style={{ fontSize: '1rem', padding: '0.9rem' }}
          >
            {chargement ? "⏳ Génération en cours..." : "🚀 Générer le code"}
          </button>
          <div className="status">{statut}</div>
          
          {historique.length > 0 && (
            <div className="history">
              <h4>📁 Projets récents</h4>
              {historique.map(item => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => chargerProjet(item)}
                >
                  <div style={{ fontSize: '0.9rem' }}>{item.nom}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.date}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel panel-right">
          <div className="preview-container">
            <div className="preview-toolbar">
              <h3>👁️ Prévisualisation</h3>
            </div>
            {code ? (
              <iframe
                srcDoc={code}
                title="Prévisualisation"
                sandbox="allow-scripts"
              />
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '6rem' }}>
                Ton projet s'affichera ici en temps réel
              </p>
            )}
          </div>
          
          {code && (
            <div className="code-container">
              <div className="code-header">
                <span>📄 Code généré</span>
                <button className="btn-secondary" onClick={copier} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                  Copier
                </button>
              </div>
              <pre>{code}</pre>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
