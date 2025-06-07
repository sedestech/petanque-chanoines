import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Modal } from '@/components/ui/modal.jsx'
import {
  fetchRows,
  insertRow,
  updateRow,
  deleteRow,
  subscribeToTable,
  persistData
} from './remoteStorage.js'
import { Users, Trophy, Play, Settings, Archive, Crown, Plus, Edit, Trash2, Medal } from 'lucide-react'
import './App.css'
import AdminView from '@/views/AdminView.jsx'
import JoueurView from '@/views/JoueurView.jsx'
import ArchivesView from '@/views/ArchivesView.jsx'
import HomeView from '@/views/HomeView.jsx'
import PartieCard from '@/components/PartieCard.jsx'


function App() {
  const [currentView, setCurrentView] = useState('home')
  const [, setIsArbitre] = useState(false)
  const [password, setPassword] = useState('')
  const [joueurs, setJoueurs] = useState([])
  const [concours, setConcours] = useState(null)
  const [equipes, setEquipes] = useState([])
  const [editingJoueur, setEditingJoueur] = useState(null)
  const [newJoueur, setNewJoueur] = useState({ pseudo: '', paye: false, arbitre: false })
  const [nomEquipe, setNomEquipe] = useState('')
  const [joueursSelectionnes, setJoueursSelectionnes] = useState([])
  const [nomConcours, setNomConcours] = useState('')
  const [dateConcours, setDateConcours] = useState(new Date().toISOString().split('T')[0])
  const [nombreParties, setNombreParties] = useState(3)
  const [parties, setParties] = useState([])
  const [partieActuelle, setPartieActuelle] = useState(0)
  const [showArbitreLogin, setShowArbitreLogin] = useState(false)
  const [archives, setArchives] = useState([])
  const [expandedArchive, setExpandedArchive] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Mot de passe arbitre via variable d'environnement
  const ARBITRE_PASSWORD = import.meta.env.VITE_ARBITRE_PASSWORD || ''

  // Chargement des données depuis Supabase
  useEffect(() => {
    async function fetchData() {
      const savedJoueurs = await fetchRows('joueurs')
      const savedConcoursArr = await fetchRows('concours')
      const savedEquipes = await fetchRows('equipes')
      const savedParties = await fetchRows('parties')
      const savedArchives = await fetchRows('archives')

      setJoueurs(savedJoueurs)
      setConcours(savedConcoursArr[0] || null)
      setEquipes(savedEquipes)
      setParties(savedParties)
      setArchives(savedArchives)
      setDataLoaded(true)
    }
    fetchData()

    const unsubscribers = [
      subscribeToTable('joueurs', setJoueurs),
      subscribeToTable('concours', data => setConcours(data[0] || null)),
      subscribeToTable('equipes', setEquipes),
      subscribeToTable('parties', setParties),
      subscribeToTable('archives', setArchives)
    ]

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [])


  // Sauvegarde automatique
  useEffect(() => {
    if (dataLoaded) {
      persistData('joueurs', joueurs)
    }
  }, [joueurs, dataLoaded])

  useEffect(() => {
    if (dataLoaded) {
      persistData('concours', concours)
    }
  }, [concours, dataLoaded])

  useEffect(() => {
    if (dataLoaded) {
      persistData('equipes', equipes)
    }
  }, [equipes, dataLoaded])

  useEffect(() => {
    if (dataLoaded) {
      persistData('parties', parties)
    }
  }, [parties, dataLoaded])

  useEffect(() => {
    if (dataLoaded) {
      persistData('archives', archives)
    }
  }, [archives, dataLoaded])

  // Redirection automatique si le concours est archivé depuis un autre client
  useEffect(() => {
    if (!concours && (currentView === 'equipes' || currentView === 'parties')) {
      setCurrentView('admin')
    }
  }, [concours, currentView])

  const handleArbitreLogin = () => {
    if (password === ARBITRE_PASSWORD) {
      setIsArbitre(true)
      setCurrentView('admin')
      setPassword('')
    } else {
      alert('Mot de passe incorrect')
    }
  }

  const ajouterJoueur = async () => {
    if (newJoueur.pseudo.trim()) {
      const joueur = {
        id: crypto.randomUUID(),
        pseudo: newJoueur.pseudo.trim(),
        paye: newJoueur.paye,
        arbitre: newJoueur.arbitre
      }
      setJoueurs([...joueurs, joueur])
      setNewJoueur({ pseudo: '', paye: false, arbitre: false })
      await insertRow('joueurs', joueur)
    }
  }

  const modifierJoueur = async (id, updates) => {
    setJoueurs(joueurs.map(j => j.id === id ? { ...j, ...updates } : j))
    setEditingJoueur(null)
    await updateRow('joueurs', id, updates)
  }

  const supprimerJoueur = async (id) => {
    const joueur = joueurs.find(j => j.id === id)
    if (!joueur) return

    if (
      concours &&
      concours.statut === 'en_cours' &&
      equipes.some(e => e.joueurs.includes(joueur.pseudo))
    ) {
      alert('Impossible de supprimer ce joueur car il est dans une équipe du concours en cours')
      return
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      setJoueurs(joueurs.filter(j => j.id !== id))
      await deleteRow('joueurs', id)
    }
  }

  const creerConcours = async (nom, date, nombreParties = 3, dureePartie = 20) => {
    const nouveauConcours = {
      id: crypto.randomUUID(),
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
    await persistData('concours', nouveauConcours)

  }

  const genererParties = () => {
    if (equipes.length < 2) return []
    
    const nouvellesParties = []
    const equipesTriees = [...equipes].sort((a, b) => b.victoires - a.victoires || b.points - a.points)
    
    // Appariement des équipes consécutives au classement
    for (let i = 0; i < equipesTriees.length - 1; i += 2) {
      const partie = {
        id: crypto.randomUUID(),
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

  const commencerParties = async () => {
    const nouvellesParties = genererParties()
    setParties(nouvellesParties)
    await persistData('parties', nouvellesParties)

    setCurrentView('parties')
  }
  const terminerConcours = async () => {
    if (!concours) return
    if (confirm("Êtes-vous sûr de vouloir terminer ce concours ?")) {
      await deleteRow("concours", concours.id)
      equipes.forEach(e => deleteRow("equipes", e.id))
      parties.forEach(p => deleteRow("parties", p.id))
      setConcours(null)
      setEquipes([])
      setParties([])
      setPartieActuelle(0)
      setCurrentView("admin")
    }
  }


  const enregistrerScore = async (partieId, score1, score2) => {
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

    await persistData('parties', partiesUpdated)

    
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

      await persistData('equipes', equipesUpdated)

    }
  }

  const renderHome = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header avec icône arbitre */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">La Pétanque des Chanoines</h1>
            </div>
          </div>
          
          {/* Icône d'accès arbitre */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowArbitreLogin(!showArbitreLogin)}
              className="p-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            {/* Menu déroulant pour l'accès arbitre */}
            {showArbitreLogin && (
              <Card className="absolute right-0 top-12 w-64 z-10 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Accès Arbitre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="Mot de passe..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleArbitreLogin()}
                      className="text-sm"
                    />
                    <Button onClick={handleArbitreLogin} size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Affichage direct du classement */}
        <div className="space-y-4">
          {renderJoueurContent()}
        </div>
      </div>
    </div>
  )

  const renderJoueurContent = () => {
    if (!concours) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun concours en cours</h3>
          </CardContent>
        </Card>
      )
    }

    const equipesTriees = equipes.sort((a, b) => b.victoires - a.victoires || b.points - a.points)

    return (
      <>
        {/* Informations du concours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>{concours.nom}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium">
                  {new Date(concours.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Équipes</span>
                <span className="text-sm font-medium">{equipes.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progression</span>
                <span className="text-sm font-medium">
                  {parties.length > 0 ? `Partie ${partieActuelle + 1}/${concours.nombreParties}` : `0/${concours.nombreParties} parties`}
                </span>
              </div>
              
              {parties.length > 0 && partieActuelle < concours.nombreParties && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((partieActuelle + 1) / concours.nombreParties) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="w-5 h-5" />
              <span>Classement en temps réel</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipesTriees.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucune équipe formée</p>
            ) : (
              equipesTriees.map((equipe, index) => (
                <div key={equipe.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={index < 3 ? "default" : "outline"} className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{equipe.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {equipe.joueurs.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{equipe.victoires} pts</div>
                    <div className="text-sm text-muted-foreground">{equipe.points} buts</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Archives des concours précédents */}
        {archives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Archive className="w-5 h-5" />
                <span>Concours précédents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {archives.map((archive, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    onClick={() => setExpandedArchive(expandedArchive === index ? null : index)}
                    className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{archive.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(archive.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {expandedArchive === index ? '▼' : '▶'}
                    </div>
                  </button>
                  
                  {expandedArchive === index && (
                    <div className="px-3 pb-3 space-y-2 border-t bg-muted/20">
                      <div className="pt-3">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Crown className="w-4 h-4" />
                          <span>Classement final</span>
                        </h4>
                        {archive.classementFinal.map((equipe, pos) => (
                          <div key={pos} className="flex items-center justify-between py-2 px-2 rounded">
                            <div className="flex items-center space-x-2">
                              <Badge variant={pos < 3 ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                {pos + 1}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium">{equipe.nom}</p>
                                <p className="text-xs text-muted-foreground">
                                  {equipe.joueurs.join(', ')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium">{equipe.victoires} pts</div>
                              <div className="text-xs text-muted-foreground">{equipe.points} buts</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </>
    )
  }



  const renderJoueursView = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView('admin')}>
            ← Retour
          </Button>
          <h1 className="text-xl font-bold">Gestion des Joueurs</h1>
          <Users className="w-6 h-6 text-primary" />
        </div>

        {/* Ajouter un nouveau joueur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un joueur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pseudo">Pseudo</Label>
              <Input
                id="pseudo"
                placeholder="Nom du joueur..."
                value={newJoueur.pseudo}
                onChange={(e) => setNewJoueur({...newJoueur, pseudo: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && ajouterJoueur()}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paye"
                  checked={newJoueur.paye}
                  onCheckedChange={(checked) => setNewJoueur({...newJoueur, paye: checked})}
                />
                <Label htmlFor="paye">A payé</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="arbitre"
                  checked={newJoueur.arbitre}
                  onCheckedChange={(checked) => setNewJoueur({...newJoueur, arbitre: checked})}
                />
                <Label htmlFor="arbitre">Arbitre</Label>
              </div>
            </div>
            
            <Button onClick={ajouterJoueur} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </CardContent>
        </Card>

        {/* Liste des joueurs */}
        <Card>
          <CardHeader>
            <CardTitle>Joueurs inscrits ({joueurs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {joueurs.length === 0 ? (
              <p className="text-muted-foreground text-center">Aucun joueur inscrit</p>
            ) : (
              <div className="space-y-3">
                {joueurs
                  .sort((a, b) => a.pseudo.localeCompare(b.pseudo))
                  .map((joueur) => (
                  <div key={joueur.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{joueur.pseudo}</p>
                        <div className="flex space-x-2">
                          {joueur.paye && <Badge variant="outline" className="text-xs">Payé</Badge>}
                          {joueur.arbitre && <Badge variant="default" className="text-xs">Arbitre</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingJoueur(joueur)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => supprimerJoueur(joueur.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal d'édition */}
        {editingJoueur && (
          <Modal open={!!editingJoueur} onClose={() => setEditingJoueur(null)}>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Modifier {editingJoueur.pseudo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-pseudo">Pseudo</Label>
                  <Input
                    id="edit-pseudo"
                    value={editingJoueur.pseudo}
                    onChange={(e) => setEditingJoueur({ ...editingJoueur, pseudo: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-paye"
                      checked={editingJoueur.paye}
                      onCheckedChange={(checked) => setEditingJoueur({ ...editingJoueur, paye: checked })}
                    />
                    <Label htmlFor="edit-paye">A payé</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-arbitre"
                      checked={editingJoueur.arbitre}
                      onCheckedChange={(checked) => setEditingJoueur({ ...editingJoueur, arbitre: checked })}
                    />
                    <Label htmlFor="edit-arbitre">Arbitre</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => modifierJoueur(editingJoueur.id, editingJoueur)} className="flex-1">
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={() => setEditingJoueur(null)} className="flex-1">
                    Annuler
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => supprimerJoueur(editingJoueur.id)}
                  className="w-full"
                >
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          </Modal>
        )}
      </div>
    </div>
  )

  const renderConcoursView = () => {
    const handleCreerConcours = async () => {
      if (nomConcours.trim()) {
        await creerConcours(nomConcours.trim(), dateConcours, nombreParties)
        setCurrentView('admin')
      }
    }

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setCurrentView('admin')}>
              ← Retour
            </Button>
            <h1 className="text-xl font-bold">Gestion des Concours</h1>
            <Trophy className="w-6 h-6 text-primary" />
          </div>

          {concours ? (
            <Card>
              <CardHeader>
                <CardTitle>Concours en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{concours.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(concours.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {concours.nombreParties} parties de {concours.dureePartie} minutes
                    </p>
                  </div>
                  <Badge variant="outline">
                    {concours.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                  </Badge>

                  {equipes.length > 0 && (
                    <Button
                      onClick={() => {
                        if (parties.length === 0) {
                          commencerParties()
                        } else {
                          setCurrentView('parties')
                        }
                      }}
                      className="w-full"
                      variant="outline"
                      disabled={parties.length === 0 && equipes.length < 2}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {parties.length === 0 ? 'Commencer les parties' : 'Reprendre les parties'}
                    </Button>
                  )}

                  {concours.statut === 'en_cours' && (
                    <Button
                      variant="destructive"
                      onClick={terminerConcours}
                      className="w-full"
                    >
                      Terminer le concours
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Créer un nouveau concours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nom-concours">Nom du concours</Label>
                  <Input
                    id="nom-concours"
                    placeholder="Ex: Tournoi d'été 2024"
                    value={nomConcours}
                    onChange={(e) => setNomConcours(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date-concours">Date</Label>
                  <Input
                    id="date-concours"
                    type="date"
                    value={dateConcours}
                    onChange={(e) => setDateConcours(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nombre-parties">Nombre de parties</Label>
                  <Input
                    id="nombre-parties"
                    type="number"
                    min="1"
                    max="10"
                    value={nombreParties}
                    onChange={(e) => setNombreParties(parseInt(e.target.value) || 3)}
                  />
                </div>
                
                <Button onClick={handleCreerConcours} className="w-full">
                  <Trophy className="w-4 h-4 mr-2" />
                  Créer le concours
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const renderEquipesView = () => {
    const joueursRestants = joueurs.filter(
      (j) => !j.arbitre && !equipes.some((e) => e.joueurs.includes(j.pseudo))
    )

    const formerEquipesAleatoires = async () => {
      if (joueursRestants.length < 2) {
        alert('Il faut au moins 2 joueurs (non arbitres) pour former des équipes')
        return
      }

      const nombreEquipes = Math.ceil(joueursRestants.length / 3)
      const nouvellesEquipes = []
      const joueursAleatoires = [...joueursRestants]

      for (let i = joueursAleatoires.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[joueursAleatoires[i], joueursAleatoires[j]] = [joueursAleatoires[j], joueursAleatoires[i]]
      }

      for (let i = 0; i < nombreEquipes; i++) {
        nouvellesEquipes.push({
          id: crypto.randomUUID(),
          nom: `Équipe ${equipes.length + i + 1}`,
          joueurs: [],
          victoires: 0,
          points: 0,
          partiesJouees: 0,
        })
      }

      joueursAleatoires.forEach((joueur, index) => {
        const equipeIndex = index % nombreEquipes
        nouvellesEquipes[equipeIndex].joueurs.push(joueur.pseudo)
      })

      const updated = [...equipes, ...nouvellesEquipes]
      setEquipes(updated)
      await persistData('equipes', updated)
    }

    const supprimerEquipe = async (id) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
        const updated = equipes.filter((e) => e.id !== id)
        setEquipes(updated)
        await persistData('equipes', updated)
      }
    }

    const ajouterEquipeManuellement = async () => {
      if (nomEquipe.trim() && joueursSelectionnes.length > 0) {
        const joueursEquipe = joueursSelectionnes.map(
          (id) => joueurs.find((j) => j.id === id).pseudo
        )
        const nouvelleEquipe = {
          id: crypto.randomUUID(),
          nom: nomEquipe.trim(),
          joueurs: joueursEquipe,
          victoires: 0,
          points: 0,
          partiesJouees: 0,
        }
        const updated = [...equipes, nouvelleEquipe]
        setEquipes(updated)
        await persistData('equipes', updated)
        setNomEquipe('')
        setJoueursSelectionnes([])
      }
    }

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setCurrentView('admin')}>
              ← Retour
            </Button>
            <h1 className="text-xl font-bold">Gestion des Équipes</h1>
            <Play className="w-6 h-6 text-primary" />
          </div>

          {!concours ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Créez d'abord un concours pour gérer les équipes
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" /> Créer une équipe manuellement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nom de l'équipe"
                    value={nomEquipe}
                    onChange={(e) => setNomEquipe(e.target.value)}
                  />
                  <div className="space-y-1">
                    {joueursRestants.map((j) => (
                      <label key={j.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={joueursSelectionnes.includes(j.id)}
                          onCheckedChange={(c) => {
                            if (c) {
                              setJoueursSelectionnes([...joueursSelectionnes, j.id])
                            } else {
                              setJoueursSelectionnes(joueursSelectionnes.filter((id) => id !== j.id))
                            }
                          }}
                          id={`chk-${j.id}`}
                        />
                        <span>{j.pseudo}</span>
                      </label>
                    ))}
                    {joueursRestants.length === 0 && (
                      <p className="text-sm text-muted-foreground">Plus de joueurs disponibles</p>
                    )}
                  </div>
                  <Button
                    onClick={ajouterEquipeManuellement}
                    className="w-full"
                    disabled={nomEquipe.trim() === '' || joueursSelectionnes.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Ajouter l'équipe
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="w-5 h-5 mr-2" /> Formation automatique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Joueurs disponibles: {joueursRestants.length} (arbitres exclus)</p>
                    <p>Équipes possibles: {Math.ceil(joueursRestants.length / 3)}</p>
                  </div>
                  <Button onClick={formerEquipesAleatoires} className="w-full" disabled={joueursRestants.length < 2}>
                    <Play className="w-4 h-4 mr-2" /> Former les équipes automatiquement
                  </Button>
                  {joueursRestants.length < 2 && (
                    <p className="text-sm text-destructive">Il faut au moins 2 joueurs (non arbitres)</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Équipes formées ({equipes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {equipes.length === 0 ? (
                    <p className="text-muted-foreground text-center">Aucune équipe formée</p>
                  ) : (
                    <div className="space-y-3">
                      {equipes.map((equipe) => (
                        <div key={equipe.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{equipe.nom}</h3>
                            <Button size="sm" variant="destructive" onClick={() => supprimerEquipe(equipe.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {equipe.joueurs.map((joueur, index) => (
                                <Badge key={index} variant="outline">
                                  {joueur}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{equipe.joueurs.length} joueur(s)</span>
                              <span>Victoires: {equipe.victoires} | Points: {equipe.points}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {equipes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button onClick={commencerParties} className="w-full" disabled={equipes.length < 2}>
                      <Trophy className="w-4 h-4 mr-2" /> Commencer les parties
                    </Button>
                    {equipes.length < 2 && <p className="text-sm text-destructive">Il faut au moins 2 équipes pour commencer</p>}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const renderPartiesView = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView('equipes')}>
            ← Retour
          </Button>
          <h1 className="text-xl font-bold">Gestion des Parties</h1>
          <Play className="w-6 h-6 text-primary" />
        </div>

        {/* Informations du concours */}
        {concours && (
          <Card>
            <CardHeader>
              <CardTitle>{concours.nom}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>Partie {partieActuelle + 1} / {concours.nombreParties}</span>
                <span>Durée: {concours.dureePartie} min</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des parties */}
        <Card>
          <CardHeader>
            <CardTitle>Parties en cours ({parties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {parties.length === 0 ? (
              <p className="text-muted-foreground text-center">
                Aucune partie générée
              </p>
            ) : (
              <div className="space-y-4">
                {parties.map((partie) => (
                  <PartieCard
                    key={partie.id}
                    partie={partie}
                    onEnregistrerScore={enregistrerScore}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classement en temps réel */}
        <Card>
          <CardHeader>
            <CardTitle>Classement en temps réel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipes
                .sort((a, b) => b.victoires - a.victoires || b.points - a.points)
                .map((equipe, index) => (
                  <div key={equipe.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant={index < 3 ? "default" : "outline"}>
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{equipe.nom}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>{equipe.victoires} pts</div>
                      <div className="text-muted-foreground">{equipe.points} buts</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions pour la partie suivante */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={async () => {
                if (partieActuelle + 1 >= concours.nombreParties) {
                  // Concours terminé - archiver
                  const equipesTriees = equipes.sort((a, b) => b.victoires - a.victoires || b.points - a.points)
                  const nouvelleArchive = {
                    nom: concours.nom,
                    date: concours.date,
                    classementFinal: equipesTriees.map(equipe => ({
                      nom: equipe.nom,
                      joueurs: equipe.joueurs,
                      victoires: equipe.victoires,
                      points: equipe.points
                    }))
                  }

                  const updatedArchives = [...archives, nouvelleArchive]
                  setArchives(updatedArchives)
                  await persistData('archives', updatedArchives)
                  
                  // Réinitialiser pour un nouveau concours
                  setConcours(null)
                  setEquipes([])
                  setParties([])
                  setPartieActuelle(0)
                  setCurrentView('admin')
                  
                  // Nettoyer les données du concours sur Supabase
                  deleteRow('concours', concours.id)
                  equipes.forEach(e => deleteRow('equipes', e.id))
                  parties.forEach(p => deleteRow('parties', p.id))
                  
                  alert(`Concours "${concours.nom}" terminé et archivé !`)
                } else {
                  // Générer la partie suivante
                  const nouvellesParties = genererParties()
                  setParties(nouvellesParties)
                  await persistData('parties', nouvellesParties)
                  setPartieActuelle(partieActuelle + 1)
                }
              }}
              className="w-full"
              disabled={parties.some(p => p.statut !== 'terminee')}
            >
              <Play className="w-4 h-4 mr-2" />
              {partieActuelle + 1 >= concours.nombreParties ? 'Terminer le concours' : 'Générer la partie suivante'}
            </Button>
            
            {parties.some(p => p.statut !== 'terminee') && (
              <p className="text-sm text-muted-foreground">
                Terminez toutes les parties en cours avant de continuer
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )



  // Rendu conditionnel basé sur la vue actuelle
  switch (currentView) {
    case 'home':
      return renderHome()
    case 'joueur':
      return <JoueurView setCurrentView={setCurrentView} concours={concours} equipes={equipes} />
    case 'admin':
      return (
        <AdminView
          setCurrentView={setCurrentView}
          setIsArbitre={setIsArbitre}
          concours={concours}
          equipes={equipes}
          parties={parties}
          partieActuelle={partieActuelle}
          commencerParties={commencerParties}
          setConcours={setConcours}
          setEquipes={setEquipes}
          setParties={setParties}
          setPartieActuelle={setPartieActuelle}
        />
      )
    case 'joueurs':
      return renderJoueursView()
    case 'concours':
      return renderConcoursView()
    case 'equipes':
      return renderEquipesView()
    case 'parties':
      return renderPartiesView()
    case 'archives':

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
