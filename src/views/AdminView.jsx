
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
          <Button onClick={() => setCurrentView('joueurs')} className="h-20 flex-col" variant="outline">
            <Users className="w-6 h-6 mb-2" />
            Joueurs
          </Button>
          <Button onClick={() => setCurrentView('concours')} className="h-20 flex-col" variant="outline">
            <Trophy className="w-6 h-6 mb-2" />
            Concours
          </Button>
          <Button onClick={() => setCurrentView('equipes')} className="h-20 flex-col" variant="outline">
            <Play className="w-6 h-6 mb-2" />
            Équipes
          </Button>
          <Button onClick={() => setCurrentView('archives')} className="h-20 flex-col" variant="outline">
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
                  Les données sont stockées localement sur chaque appareil. Pour que tous les joueurs voient les mêmes informations, ils doivent utiliser le même appareil ou navigateur.
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

