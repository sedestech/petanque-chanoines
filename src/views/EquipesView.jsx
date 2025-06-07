import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Play, Plus, Trash2, Trophy } from 'lucide-react'
import { persistData } from '../remoteStorage.js'

export default function EquipesView({
  joueurs,
  equipes,
  setEquipes,
  concours,
  commencerParties,
  setCurrentView,
}) {
  const [nomEquipe, setNomEquipe] = useState('')
  const [joueursSelectionnes, setJoueursSelectionnes] = useState([])

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
      nouvellesEquipes.push({ id: crypto.randomUUID(), nom: `Équipe ${equipes.length + i + 1}`, joueurs: [], victoires: 0, points: 0, partiesJouees: 0 })
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
          <Button variant="ghost" onClick={() => setCurrentView('admin')}>← Retour</Button>
          <h1 className="text-xl font-bold">Gestion des Équipes</h1>
          <Play className="w-6 h-6 text-primary" />
        </div>
        {!concours ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Créez d'abord un concours pour gérer les équipes</p>
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
                            {equipe.joueurs.map((joueur, idx) => (
                              <Badge key={idx} variant="outline">
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
