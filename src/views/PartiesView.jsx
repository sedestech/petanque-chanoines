import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import PartieCard from '@/components/PartieCard.jsx'
import { Play, Trophy } from 'lucide-react'

export default function PartiesView({
  setCurrentView,
  concours,
  parties,
  partieActuelle,
  enregistrerScore,
  genererParties,
  setParties,
  setPartieActuelle,
  archives,
  setArchives,
  equipes,
  setEquipes,
  setConcours,
}) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView('equipes')}>← Retour</Button>
          <h1 className="text-xl font-bold">Gestion des Parties</h1>
          <Play className="w-6 h-6 text-primary" />
        </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Parties en cours ({parties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {parties.length === 0 ? (
              <p className="text-muted-foreground text-center">Aucune partie générée</p>
            ) : (
              <div className="space-y-4">
                {parties.map((partie) => (
                  <PartieCard key={partie.id} partie={partie} onEnregistrerScore={enregistrerScore} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
                      <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
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
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                if (partieActuelle + 1 >= concours.nombreParties) {
                  const equipesTriees = equipes.sort((a, b) => b.victoires - a.victoires || b.points - a.points)
                  const nouvelleArchive = {
                    nom: concours.nom,
                    date: concours.date,
                    classementFinal: equipesTriees.map((equipe) => ({ nom: equipe.nom, joueurs: equipe.joueurs, victoires: equipe.victoires, points: equipe.points }))
                  }
                  setArchives([...archives, nouvelleArchive])
                  setConcours(null)
                  setEquipes([])
                  setParties([])
                  setPartieActuelle(0)
                  setCurrentView('admin')
                  localStorage.removeItem('petanque_concours')
                  localStorage.removeItem('petanque_equipes')
                  localStorage.removeItem('petanque_parties')
                  alert(`Concours "${concours.nom}" terminé et archivé !`)
                } else {
                  const nouvellesParties = genererParties()
                  setParties(nouvellesParties)
                  setPartieActuelle(partieActuelle + 1)
                }
              }}
              className="w-full"
              disabled={parties.some((p) => p.statut !== 'terminee')}
            >
              <Play className="w-4 h-4 mr-2" />
              {partieActuelle + 1 >= concours.nombreParties ? 'Terminer le concours' : 'Générer la partie suivante'}
            </Button>
            {parties.some((p) => p.statut !== 'terminee') && (
              <p className="text-sm text-muted-foreground">Terminez toutes les parties en cours avant de continuer</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
