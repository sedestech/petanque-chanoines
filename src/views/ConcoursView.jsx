import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Trophy } from 'lucide-react'

export default function ConcoursView({
  setCurrentView,
  nomConcours,
  setNomConcours,
  dateConcours,
  setDateConcours,
  nombreParties,
  setNombreParties,
  creerConcours,
  concours,
  arreterConcours,
}) {
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
          <Button variant="ghost" onClick={() => setCurrentView('admin')}>← Retour</Button>
          <h1 className="text-xl font-bold">Gestion des Concours</h1>
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        {concours ? (
          <Card>
            <CardHeader>
              <CardTitle>Concours en cours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{concours.nom}</p>
                <p className="text-sm text-muted-foreground">{new Date(concours.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <Button variant="destructive" onClick={arreterConcours} className="w-full">
                Terminer le concours
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" /> Créer un concours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nom-concours">Nom du concours</Label>
                <Input id="nom-concours" placeholder="Ex: Tournoi d'été 2024" value={nomConcours} onChange={(e) => setNomConcours(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="date-concours">Date</Label>
                <Input id="date-concours" type="date" value={dateConcours} onChange={(e) => setDateConcours(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="nombre-parties">Nombre de parties</Label>
                <Input id="nombre-parties" type="number" min="1" max="10" value={nombreParties} onChange={(e) => setNombreParties(parseInt(e.target.value) || 3)} />
              </div>
              <Button onClick={handleCreerConcours} className="w-full">
                <Trophy className="w-4 h-4 mr-2" /> Créer le concours
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
