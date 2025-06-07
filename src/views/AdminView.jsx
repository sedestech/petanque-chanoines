
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Crown, Users, Trophy, Play, Archive } from 'lucide-react'
import { deleteRow } from '../remoteStorage.js'

function AdminView({
  setCurrentView,
  setIsArbitre,
  concours,
  equipes,
  parties,
  partieActuelle,
  commencerParties,
  setConcours,
  setEquipes,
  setParties,
  setPartieActuelle,
}) {

  const handleTerminate = async () => {
    if (confirm('Êtes-vous sûr de vouloir terminer ce concours ?')) {
      await deleteRow('concours', concours.id)
      equipes.forEach((e) => deleteRow('equipes', e.id))
      parties.forEach((p) => deleteRow('parties', p.id))
      setConcours(null)
      setEquipes([])
      setParties([])
      setPartieActuelle(0)
      setCurrentView('admin')
    }
  }

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

        <Card>
          <CardContent className="grid grid-cols-2 gap-4">
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
                {equipes.length === 0 ? (
                  <Button
                    onClick={() => setCurrentView('equipes')}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Créer les équipes
                  </Button>
                ) : (
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
                <Button variant="destructive" onClick={handleTerminate} className="w-full">
                  Terminer le concours
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

