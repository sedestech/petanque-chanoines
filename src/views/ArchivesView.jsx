
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Archive, Trophy, Crown, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge.jsx'

function ArchivesView({ archives, setArchives, setCurrentView }) {
  const supprimerArchive = (index) => {
    const nouvellesArchives = archives.filter((_, i) => i !== index)
    setArchives(nouvellesArchives)
  }


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setCurrentView('admin')} variant="outline" className="flex items-center space-x-2">
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
                    <Button onClick={() => supprimerArchive(index)} variant="destructive" size="sm" className="flex items-center space-x-1">
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
                            <Badge variant={pos < 3 ? 'default' : 'outline'} className="w-8 h-8 rounded-full flex items-center justify-center">
                              {pos + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{equipe.nom}</p>
                              <p className="text-sm text-muted-foreground">{equipe.joueurs.join(', ')}</p>
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

export default ArchivesView

