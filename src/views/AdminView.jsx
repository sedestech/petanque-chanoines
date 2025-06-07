
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Crown, Users, Trophy, Play, Archive } from 'lucide-react'

function AdminView({ setCurrentView, setIsArbitre, concours, equipes, parties, partieActuelle }) {

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => { setCurrentView('home'); setIsArbitre(false) }}>
            ← Déconnexion
          </Button>
          <h1 className="text-xl font-bold">Administration</h1>
          <Crown className="w-6 h-6 text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-0">
            <Button onClick={() => setCurrentView('joueurs')} className="h-20 flex-col w-full" variant="ghost">
              <Users className="w-6 h-6 mb-2" />
              Joueurs
            </Button>
          </Card>
          <Card className="p-0">
            <Button onClick={() => setCurrentView('concours')} className="h-20 flex-col w-full" variant="ghost">
              <Trophy className="w-6 h-6 mb-2" />
              Concours
            </Button>
          </Card>
          <Card className="p-0">
            <Button onClick={() => setCurrentView('equipes')} className="h-20 flex-col w-full" variant="ghost">
              <Play className="w-6 h-6 mb-2" />
              Équipes
            </Button>
          </Card>
          <Card className="p-0">
            <Button onClick={() => setCurrentView('archives')} className="h-20 flex-col w-full" variant="ghost">
              <Archive className="w-6 h-6 mb-2" />
              Archives
            </Button>
          </Card>
        </div>

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
                  <Button onClick={() => setCurrentView('parties')} className="w-full" variant="outline">
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
}

export default AdminView

