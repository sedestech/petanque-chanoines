// Service API pour communiquer avec le backend Flask
const API_BASE_URL = 'https://4vgh0i1cddk5.manus.space/api';

class ApiService {
  // Méthode utilitaire pour les requêtes HTTP
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Si la réponse est vide (204 No Content), retourner null
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== JOUEURS =====
  
  async getJoueurs() {
    return this.request('/joueurs');
  }

  async createJoueur(joueur) {
    return this.request('/joueurs', {
      method: 'POST',
      body: JSON.stringify(joueur),
    });
  }

  async updateJoueur(id, updates) {
    return this.request(`/joueurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteJoueur(id) {
    return this.request(`/joueurs/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== CONCOURS =====
  
  async getConcoursActuel() {
    return this.request('/concours/actuel');
  }

  async createConcours(concours) {
    return this.request('/concours', {
      method: 'POST',
      body: JSON.stringify(concours),
    });
  }

  // ===== ÉQUIPES =====
  
  async getEquipes() {
    return this.request('/equipes');
  }

  async genererEquipes() {
    return this.request('/equipes/generer', {
      method: 'POST',
    });
  }

  // ===== PARTIES =====
  
  async getParties() {
    return this.request('/parties');
  }

  async genererParties() {
    return this.request('/parties/generer', {
      method: 'POST',
    });
  }

  async enregistrerScore(partieId, score1, score2) {
    return this.request(`/parties/${partieId}/score`, {
      method: 'PUT',
      body: JSON.stringify({ score1, score2 }),
    });
  }

  // ===== ARCHIVES =====
  
  async getArchives() {
    return this.request('/archives');
  }

  async deleteArchive(id) {
    return this.request(`/archives/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== STATUT =====
  
  async getStatus() {
    return this.request('/status');
  }
}

// Instance singleton du service API
const apiService = new ApiService();

export default apiService;

