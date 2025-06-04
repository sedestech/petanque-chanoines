import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Users, Trophy, Play, Settings, Archive, Crown, Plus, Edit, Trash2, UserCheck, Medal } from 'lucide-react'
import apiService from './services/api.js'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [isArbitre, setIsArbitre] = useState(false)
  const [password, setPassword] = useState('')
  const [joueurs, setJoueurs] = useState([])
  const [concours, setConcours] = useState(null)
  const [equipes, setEquipes] = useState([])
  const [editingJoueur, setEditingJoueur] = useState(null)
  const [newJoueur, setNewJoueur] = useState({ pseudo: '', paye: false, arbitre: false })
  const [nomConcours, setNomConcours] = useState('')
  const [dateConcours, setDateConcours] = useState(new Date().toISOString().split('T')[0])
  const [nombreParties, setNombreParties] = useState(3)
  const [parties, setParties] = useState([])
  const [partieActuelle, setPartieActuelle] = useState(0)
  const [scores, setScores] = useState({ equipe1: '', equipe2: '' })
  const [showArbitreLogin, setShowArbitreLogin] = useState(false)
  const [archives, setArchives] = useState([])
  const [expandedArchive, setExpandedArchive] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mot de passe arbitre (codé en dur comme demandé)
  const ARBITRE_PASSWORD = 'chanoine2024'

  // Chargement des données depuis l'API
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Charger toutes les données en parallèle
      const [joueursData, concoursData, equipesData, partiesData, archivesData] = await Promise.all([
        apiService.getJoueurs(),
        apiService.getConcoursActuel(),
        apiService.getEquipes(),
        apiService.getParties(),
        apiService.getArchives()
      ])
      
      setJoueurs(joueursData || [])
      setConcours(concoursData)
      setEquipes(concoursData?.equipes || equipesData || [])
      setParties(concoursData?.parties || partiesData || [])
      setArchives(archivesData || [])
      
      if (concoursData) {
        setPartieActuelle(concoursData.partie_actuelle || 0)
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  // Chargement initial des données
  useEffect(() => {
    loadData()
  }, [])

  // Rafraîchissement automatique toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadData()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [loading])

  const handleArbitreLogin = () => {
    if (password === ARBITRE_PASSWORD) {
      setIsArbitre(true)
      setCurrentView('admin')
      setPassword('')
      setShowArbitreLogin(false)
    } else {
      alert('Mot de passe incorrect')
    }
  }

  const ajouterJoueur = async () => {
    if (newJoueur.pseudo.trim()) {
      try {
        setLoading(true)
        const joueur = await apiService.createJoueur({
          pseudo: newJoueur.pseudo.trim(),
          paye: newJoueur.paye,
          arbitre: newJoueur.arbitre
        })
        
        setJoueurs(prev => [...prev, joueur])
        setNewJoueur({ pseudo: '', paye: false, arbitre: false })
        setError(null)
      } catch (err) {
        console.error('Erreur lors de la création du joueur:', err)
        setError('Erreur lors de la création du joueur')
      } finally {
        setLoading(false)
      }
    }
  }

  const modifierJoueur = async (id, updates) => {
    try {
      setLoading(true)
      const joueurModifie = await apiService.updateJoueur(id, updates)
      setJoueurs(prev => prev.map(j => j.id === id ? joueurModifie : j))
      setEditingJoueur(null)
      setError(null)
    } catch (err) {
      console.error('Erreur lors de la modification du joueur:', err)
      setError('Erreur lors de la modification du joueur')
    } finally {
      setLoading(false)
    }
  }

  const supprimerJoueur = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      try {
        setLoading(true)
        await apiService.deleteJoueur(id)
        setJoueurs(prev => prev.filter(j => j.id !== id))
        setError(null)
      } catch (err) {
        console.error('Erreur lors de la suppression du joueur:', err)
        setError('Erreur lors de la suppression du joueur')
      } finally {
        setLoading(false)
      }
    }
  }

  const creerConcours = async (nom, date, nombreParties = 3, dureePartie = 20) => {
    try {
      setLoading(true)
      const nouveauConcours = await apiService.createConcours({
        nom,
        date,
        nombre_parties: nombreParties,
        duree_partie: dureePartie
      })
      
      setConcours(nouveauConcours)
      setEquipes([])
      setParties([])
      setPartieActuelle(0)
      setError(null)
    } catch (err) {
      console.error('Erreur lors de la création du concours:', err)
      setError('Erreur lors de la création du concours')
    } finally {
      setLoading(false)
    }
  }

  const genererEquipes = async () => {
    try {
      setLoading(true)
      const equipesGenerees = await apiService.genererEquipes()
      setEquipes(equipesGenerees)
      setError(null)
    } catch (err) {
      console.error('Erreur lors de la génération des équipes:', err)
      setError('Erreur lors de la génération des équipes')
    } finally {
      setLoading(false)
    }
  }

  const commencerParties = async () => {
    try {
      setLoading(true)
      const nouvellesParties = await apiService.genererParties()
      setParties(nouvellesParties)
      setCurrentView('parties')
      setError(null)
    } catch (err) {
      console.error('Erreur lors de la génération des parties:', err)
      setError('Erreur lors de la génération des parties')
    } finally {
      setLoading(false)
    }
  }

  const enregistrerScore = async (partieId, score1, score2) => {
    try {
      setLoading(true)
      const partieModifiee = await apiService.enregistrerScore(partieId, score1, score2)
      
      // Recharger toutes les données pour avoir les classements à jour
      await loadData()
      setError(null)
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du score:', err)
      setError('Erreur lors de l\'enregistrement du score')
    } finally {
      setLoading(false)
    }
  }

  const supprimerArchive = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette archive ?')) {
      try {
        setLoading(true)
        await apiService.deleteArchive(id)
        setArchives(prev => prev.filter(a => a.id !== id))
        setError(null)
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'archive:', err)
        setError('Erreur lors de la suppression de l\'archive')
      } finally {
        setLoading(false)
      }
    }
  }

