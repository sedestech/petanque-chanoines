import { useState, useEffect } from "react"
import HomeView from "@/views/HomeView.jsx"
import JoueurView from "@/views/JoueurView.jsx"
import AdminView from "@/views/AdminView.jsx"
import JoueursView from "@/views/JoueursView.jsx"
import ConcoursView from "@/views/ConcoursView.jsx"
import EquipesView from "@/views/EquipesView.jsx"
import PartiesView from "@/views/PartiesView.jsx"
import ArchivesView from "@/views/ArchivesView.jsx"
import "./App.css"

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

  // Mot de passe arbitre via variable d'environnement
  const ARBITRE_PASSWORD = import.meta.env.VITE_ARBITRE_PASSWORD || ''

  // Chargement des données depuis localStorage
  useEffect(() => {
    const savedJoueurs = localStorage.getItem('petanque_joueurs')
    const savedConcours = localStorage.getItem('petanque_concours')
    const savedEquipes = localStorage.getItem('petanque_equipes')
    const savedParties = localStorage.getItem('petanque_parties')
    const savedArchives = localStorage.getItem('petanque_archives')
    
    if (savedJoueurs) setJoueurs(JSON.parse(savedJoueurs))
    if (savedConcours) setConcours(JSON.parse(savedConcours))
    if (savedEquipes) setEquipes(JSON.parse(savedEquipes))
    if (savedParties) setParties(JSON.parse(savedParties))
    if (savedArchives) setArchives(JSON.parse(savedArchives))
  }, [])

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem('petanque_joueurs', JSON.stringify(joueurs))
  }, [joueurs])

  useEffect(() => {
    if (concours) localStorage.setItem('petanque_concours', JSON.stringify(concours))
  }, [concours])

  useEffect(() => {
    localStorage.setItem('petanque_equipes', JSON.stringify(equipes))
  }, [equipes])

  useEffect(() => {
    localStorage.setItem('petanque_parties', JSON.stringify(parties))
  }, [parties])

  useEffect(() => {
    localStorage.setItem('petanque_archives', JSON.stringify(archives))
  }, [archives])

  const handleArbitreLogin = () => {
    if (password === ARBITRE_PASSWORD) {
      setIsArbitre(true)
      setCurrentView('admin')
      setPassword('')
    } else {
      alert('Mot de passe incorrect')
    }
  }

  const ajouterJoueur = () => {
    if (newJoueur.pseudo.trim()) {
      const joueur = {
        id: Date.now().toString(),
        pseudo: newJoueur.pseudo.trim(),
        paye: newJoueur.paye,
        arbitre: newJoueur.arbitre
      }
      setJoueurs([...joueurs, joueur])
      setNewJoueur({ pseudo: '', paye: false, arbitre: false })
    }
  }

  const modifierJoueur = (id, updates) => {
    setJoueurs(joueurs.map(j => j.id === id ? { ...j, ...updates } : j))
    setEditingJoueur(null)
  }

  const supprimerJoueur = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      setJoueurs(joueurs.filter(j => j.id !== id))
    }
  }

  const creerConcours = (nom, date, nombreParties = 3, dureePartie = 20) => {
    const nouveauConcours = {
      id: Date.now().toString(),
      nom,
      date,
      statut: 'en_cours',
      nombreParties,
      dureePartie,
      parties: [],
      partieActuelle: 0
    }
    setConcours(nouveauConcours)
    setEquipes([])
    setParties([])
    setPartieActuelle(0)
  }

  const genererParties = () => {
    if (equipes.length < 2) return []
    
    const nouvellesParties = []
    const equipesTriees = [...equipes].sort((a, b) => b.victoires - a.victoires || b.points - a.points)
    
    // Appariement des équipes consécutives au classement
    for (let i = 0; i < equipesTriees.length - 1; i += 2) {
      const partie = {
        id: Date.now().toString() + i,
        numero: partieActuelle + 1,
        equipe1: equipesTriees[i],
        equipe2: equipesTriees[i + 1],
        score1: 0,
        score2: 0,
        statut: 'en_attente',
        heureDebut: null,
        heureFin: null
      }
      nouvellesParties.push(partie)
    }
    
    // Gestion de l'équipe impaire (rotation)
    if (equipesTriees.length % 2 === 1) {
      const equipeEnRepos = equipesTriees[equipesTriees.length - 1]
      console.log(`Équipe en repos pour cette partie: ${equipeEnRepos.nom}`)
    }
    
    return nouvellesParties
  }

  const commencerParties = () => {
    const nouvellesParties = genererParties()
    setParties(nouvellesParties)
    setCurrentView('parties')
  }

  const enregistrerScore = (partieId, score1, score2) => {
    const partiesUpdated = parties.map(partie => {
      if (partie.id === partieId) {
        return {
          ...partie,
          score1: parseInt(score1) || 0,
          score2: parseInt(score2) || 0,
          statut: 'terminee',
          heureFin: new Date().toISOString()
        }
      }
      return partie
    })
    
    setParties(partiesUpdated)
    
    // Mettre à jour les scores des équipes
    const partie = partiesUpdated.find(p => p.id === partieId)
    if (partie) {
      const equipesUpdated = equipes.map(equipe => {
        if (equipe.id === partie.equipe1.id) {
          const victoires = equipe.victoires + (partie.score1 > partie.score2 ? 3 : partie.score1 === partie.score2 ? 1 : 0)
          const points = equipe.points + partie.score1
          return { ...equipe, victoires, points, partiesJouees: equipe.partiesJouees + 1 }
        }
        if (equipe.id === partie.equipe2.id) {
          const victoires = equipe.victoires + (partie.score2 > partie.score1 ? 3 : partie.score2 === partie.score1 ? 1 : 0)
          const points = equipe.points + partie.score2
          return { ...equipe, victoires, points, partiesJouees: equipe.partiesJouees + 1 }
        }
        return equipe
      })
      
      setEquipes(equipesUpdated)
    }
  }

  // Rendu conditionnel basé sur la vue actuelle
  switch (currentView) {
    case "home":
      return (
        <HomeView
          showArbitreLogin={showArbitreLogin}
          setShowArbitreLogin={setShowArbitreLogin}
          password={password}
          setPassword={setPassword}
          handleArbitreLogin={handleArbitreLogin}
          concours={concours}
          equipes={equipes}
          parties={parties}
          partieActuelle={partieActuelle}
          archives={archives}
          expandedArchive={expandedArchive}
          setExpandedArchive={setExpandedArchive}
        />
      )
    case "joueur":
      return <JoueurView concours={concours} equipes={equipes} setCurrentView={setCurrentView} />
    case "admin":
      return <AdminView setCurrentView={setCurrentView} setIsArbitre={setIsArbitre} concours={concours} equipes={equipes} parties={parties} partieActuelle={partieActuelle} />
    case "joueurs":
      return <JoueursView joueurs={joueurs} newJoueur={newJoueur} setNewJoueur={setNewJoueur} ajouterJoueur={ajouterJoueur} editingJoueur={editingJoueur} setEditingJoueur={setEditingJoueur} modifierJoueur={modifierJoueur} supprimerJoueur={supprimerJoueur} setCurrentView={setCurrentView} />
    case "concours":
      return <ConcoursView setCurrentView={setCurrentView} nomConcours={nomConcours} setNomConcours={setNomConcours} dateConcours={dateConcours} setDateConcours={setDateConcours} nombreParties={nombreParties} setNombreParties={setNombreParties} creerConcours={creerConcours} concours={concours} />
    case "equipes":
      return <EquipesView joueurs={joueurs} equipes={equipes} setEquipes={setEquipes} concours={concours} commencerParties={commencerParties} setCurrentView={setCurrentView} />
    case "parties":
      return <PartiesView setCurrentView={setCurrentView} concours={concours} parties={parties} partieActuelle={partieActuelle} enregistrerScore={enregistrerScore} genererParties={genererParties} setParties={setParties} setPartieActuelle={setPartieActuelle} archives={archives} setArchives={setArchives} equipes={equipes} setEquipes={setEquipes} setConcours={setConcours} />
    case "archives":
      return <ArchivesView archives={archives} setArchives={setArchives} setCurrentView={setCurrentView} />
    default:
      return <HomeView
          showArbitreLogin={showArbitreLogin}
          setShowArbitreLogin={setShowArbitreLogin}
          password={password}
          setPassword={setPassword}
          handleArbitreLogin={handleArbitreLogin}
          concours={concours}
          equipes={equipes}
          parties={parties}
          partieActuelle={partieActuelle}
          archives={archives}
          expandedArchive={expandedArchive}
          setExpandedArchive={setExpandedArchive}
        />
  }

}

export default App
