import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Users, Trophy, Play, Settings, Archive, Crown, Plus, Edit, Trash2, UserCheck, Medal } from 'lucide-react'
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

  // Mot de passe arbitre (codé en dur comme demandé)
  const ARBITRE_PASSWORD = 'chanoine2024'

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
                  <p className="text-xs text-muted-foreground">Mot de passe: chanoine2024</p>
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

  const renderJoueurView = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView('home')}>
            ← Retour
          </Button>
          <h1 className="text-xl font-bold">Classement</h1>
          <div></div>
        </div>

        {!concours ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Aucun concours en cours
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{concours.nom}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipes.length === 0 ? (
                  <p className="text-muted-foreground">Aucune équipe créée</p>
                ) : (
                  equipes
                    .sort((a, b) => b.victoires - a.victoires || b.points - a.points)
                    .map((equipe, index) => (
                      <div key={equipe.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={index < 3 ? "default" : "outline"}>
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
                          <p className="font-bold">{equipe.victoires} pts</p>
                          <p className="text-sm text-muted-foreground">
                            {equipe.points} buts
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  const renderAdminView = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => {setCurrentView('home'); setIsArbitre(false)}}>
            ← Déconnexion
          </Button>
          <h1 className="text-xl font-bold">Administration</h1>
          <Crown className="w-6 h-6 text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => setCurrentView('joueurs')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <Users className="w-6 h-6 mb-2" />
            Joueurs
          </Button>
          
          <Button 
            onClick={() => setCurrentView('concours')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <Trophy className="w-6 h-6 mb-2" />
            Concours
          </Button>
          
          <Button 
            onClick={() => setCurrentView('equipes')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <Play className="w-6 h-6 mb-2" />
            Équipes
          </Button>
          
          <Button 
            onClick={() => setCurrentView('archives')} 
            className="h-20 flex-col"
            variant="outline"
          >
            <Archive className="w-6 h-6 mb-2" />
            Archives
          </Button>
        </div>

        {/* Avertissement synchronisation */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 mt-0.5 flex-shrink-0"></div>
              <div className="text-sm">
                <p className="font-medium text-orange-800">Information importante</p>
                <p className="text-orange-700">
                  Les données sont stockées localement sur chaque appareil. 
                  Pour que tous les joueurs voient les mêmes informations, 
                  ils doivent utiliser le même appareil ou navigateur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {concours && (
          <Card>
            <CardHeader>
              <CardTitle>Concours actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">{concours.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(concours.date).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Équipes: {equipes.length}</span>
                    <span>Parties: {concours.nombreParties}</span>
                  </div>
                  {parties.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Partie en cours: {partieActuelle + 1}/{concours.nombreParties}
                    </div>
                  )}
                </div>
                
                {equipes.length > 0 && parties.length > 0 && (
                  <Button 
                    onClick={() => setCurrentView('parties')}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Reprendre les parties
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

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
                  onChange={(e) => setEditingJoueur({...editingJoueur, pseudo: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-paye"
                    checked={editingJoueur.paye}
                    onCheckedChange={(checked) => setEditingJoueur({...editingJoueur, paye: checked})}
                  />
                  <Label htmlFor="edit-paye">A payé</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-arbitre"
                    checked={editingJoueur.arbitre}
                    onCheckedChange={(checked) => setEditingJoueur({...editingJoueur, arbitre: checked})}
                  />
                  <Label htmlFor="edit-arbitre">Arbitre</Label>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => modifierJoueur(editingJoueur.id, editingJoueur)}
                  className="flex-1"
                >
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setEditingJoueur(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  const renderConcoursView = () => {
    const handleCreerConcours = () => {
      if (nomConcours.trim()) {
        creerConcours(nomConcours.trim(), dateConcours, nombreParties)
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
                  
                  {concours.statut === 'en_cours' && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir terminer ce concours ?')) {
                          setConcours({...concours, statut: 'termine'})
                        }
                      }}
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
    const joueursDisponibles = joueurs.filter(j => !j.arbitre) // Exclure seulement les arbitres
    
    const formerEquipesAleatoires = () => {
      if (joueursDisponibles.length < 2) {
        alert('Il faut au moins 2 joueurs (non arbitres) pour former des équipes')
        return
      }
      
      const nombreEquipes = Math.ceil(joueursDisponibles.length / 3)
      const nouvellesEquipes = []
      const joueursAleatoires = [...joueursDisponibles]
      
      // Mélanger les joueurs
      for (let i = joueursAleatoires.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[joueursAleatoires[i], joueursAleatoires[j]] = [joueursAleatoires[j], joueursAleatoires[i]]
      }
      
      // Créer les équipes
      for (let i = 0; i < nombreEquipes; i++) {
        const equipe = {
          id: Date.now().toString() + i,
          nom: `Équipe ${i + 1}`,
          joueurs: [],
          victoires: 0,
          points: 0,
          partiesJouees: 0
        }
        nouvellesEquipes.push(equipe)
      }
      
      // Répartir les joueurs dans les équipes
      joueursAleatoires.forEach((joueur, index) => {
        const equipeIndex = index % nombreEquipes
        nouvellesEquipes[equipeIndex].joueurs.push(joueur.pseudo)
      })
      
      setEquipes(nouvellesEquipes)
    }
    
    const supprimerEquipe = (id) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
        setEquipes(equipes.filter(e => e.id !== id))
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
              {/* Formation automatique */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Formation automatique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Joueurs disponibles: {joueursDisponibles.length} (arbitres exclus)</p>
                    <p>Équipes possibles: {Math.ceil(joueursDisponibles.length / 3)}</p>
                  </div>
                  
                  <Button 
                    onClick={formerEquipesAleatoires}
                    className="w-full"
                    disabled={joueursDisponibles.length < 2}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Former les équipes automatiquement
                  </Button>
                  
                  {joueursDisponibles.length < 2 && (
                    <p className="text-sm text-destructive">
                      Il faut au moins 2 joueurs (non arbitres)
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Liste des équipes */}
              <Card>
                <CardHeader>
                  <CardTitle>Équipes formées ({equipes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {equipes.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                      Aucune équipe formée
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {equipes.map((equipe) => (
                        <div key={equipe.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{equipe.nom}</h3>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => supprimerEquipe(equipe.id)}
                            >
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

              {/* Actions */}
              {equipes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={commencerParties}
                      className="w-full"
                      disabled={equipes.length < 2}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Commencer les parties
                    </Button>
                    
                    {equipes.length < 2 && (
                      <p className="text-sm text-destructive">
                        Il faut au moins 2 équipes pour commencer
                      </p>
                    )}
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
              onClick={() => {
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
                  
                  setArchives([...archives, nouvelleArchive])
                  
                  // Réinitialiser pour un nouveau concours
                  setConcours(null)
                  setEquipes([])
                  setParties([])
                  setPartieActuelle(0)
                  setCurrentView('admin')
                  
                  // Supprimer les données du concours archivé du localStorage
                  localStorage.removeItem('petanque_concours')
                  localStorage.removeItem('petanque_equipes')
                  localStorage.removeItem('petanque_parties')
                  
                  alert(`Concours "${concours.nom}" terminé et archivé !`)
                } else {
                  // Générer la partie suivante
                  const nouvellesParties = genererParties()
                  setParties(nouvellesParties)
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

  // Composant pour afficher une partie
  const PartieCard = ({ partie, onEnregistrerScore }) => {
    const [score1, setScore1] = useState(partie.score1 === 0 ? '' : partie.score1.toString())
    const [score2, setScore2] = useState(partie.score2 === 0 ? '' : partie.score2.toString())

    const handleEnregistrer = () => {
      onEnregistrerScore(partie.id, score1, score2)
    }

    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Partie {partie.numero}</h3>
          <Badge variant={partie.statut === 'terminee' ? 'default' : 'outline'}>
            {partie.statut === 'terminee' ? 'Terminée' : 'En cours'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Équipe 1 */}
          <div className="text-center">
            <p className="font-medium text-sm">{partie.equipe1.nom}</p>
            <div className="text-xs text-muted-foreground">
              {partie.equipe1.joueurs.join(', ')}
            </div>
          </div>
          
          {/* VS */}
          <div className="text-center">
            <p className="text-lg font-bold">VS</p>
          </div>
          
          {/* Équipe 2 */}
          <div className="text-center">
            <p className="font-medium text-sm">{partie.equipe2.nom}</p>
            <div className="text-xs text-muted-foreground">
              {partie.equipe2.joueurs.join(', ')}
            </div>
          </div>
        </div>

        {partie.statut === 'terminee' ? (
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{partie.score1}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Score final</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{partie.score2}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              <Input
                type="number"
                placeholder="Score"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                min="0"
              />
              <div className="text-center text-sm text-muted-foreground">
                Scores
              </div>
              <Input
                type="number"
                placeholder="Score"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                min="0"
              />
            </div>
            
            <Button 
              onClick={handleEnregistrer}
              className="w-full"
              disabled={!score1 || !score2}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Enregistrer le score
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderArchivesView = () => {
    const supprimerArchive = (index) => {
      const nouvellesArchives = archives.filter((_, i) => i !== index)
      setArchives(nouvellesArchives)
    }

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => setCurrentView('admin')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>← Retour</span>
            </Button>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Archive className="w-6 h-6" />
              <span>Archives</span>
            </h1>
            <div className="w-20"></div>
          </div>

          {archives.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune archive</h3>
                <p className="text-muted-foreground">Les concours terminés apparaîtront ici</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {archives.map((archive, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>{archive.nom}</span>
                      </CardTitle>
                      <Button
                        onClick={() => supprimerArchive(index)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{new Date(archive.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Crown className="w-4 h-4" />
                          <span>Classement final</span>
                        </h4>
                        {archive.classementFinal.map((equipe, pos) => (
                          <div key={pos} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant={pos < 3 ? "default" : "outline"} className="w-8 h-8 rounded-full flex items-center justify-center">
                                {pos + 1}
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
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Rendu conditionnel basé sur la vue actuelle
  switch (currentView) {
    case 'home':
      return renderHome()
    case 'joueur':
      return renderJoueurView()
    case 'admin':
      return renderAdminView()
    case 'joueurs':
      return renderJoueursView()
    case 'concours':
      return renderConcoursView()
    case 'equipes':
      return renderEquipesView()
    case 'parties':
      return renderPartiesView()
    case 'archives':
      return renderArchivesView()
    default:
      return renderHome()
  }
}

export default App

