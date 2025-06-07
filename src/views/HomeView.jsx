import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Settings, Archive, Crown, Trophy, Medal } from 'lucide-react'

function JoueurContent({
  concours,
  equipes,
  parties,
  partieActuelle,
  archives,
  expandedArchive,
  setExpandedArchive,
}) {
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
              <span className="text-sm font-medium">{new Date(concours.date).toLocaleDateString('fr-FR')}</span>
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
                  <Badge variant={index < 3 ? 'default' : 'outline'} className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
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
            ))
          )}
        </CardContent>
      </Card>
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
                    <p className="text-sm text-muted-foreground">{new Date(archive.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{expandedArchive === index ? '▼' : '▶'}</div>
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
                            <Badge variant={pos < 3 ? 'default' : 'outline'} className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                              {pos + 1}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{equipe.nom}</p>
                              <p className="text-xs text-muted-foreground">{equipe.joueurs.join(', ')}</p>
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

export default function HomeView({
  showArbitreLogin,
  setShowArbitreLogin,
  password,
  setPassword,
  handleArbitreLogin,
  concours,
  equipes,
  parties,
  partieActuelle,
  archives,
  expandedArchive,
  setExpandedArchive,
}) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">La Pétanque des Chanoines</h1>
            </div>
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowArbitreLogin(!showArbitreLogin)} className="p-2">
              <Settings className="w-5 h-5" />
            </Button>
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
        <div className="space-y-4">
          <JoueurContent
            concours={concours}
            equipes={equipes}
            parties={parties}
            partieActuelle={partieActuelle}
            archives={archives}
            expandedArchive={expandedArchive}
            setExpandedArchive={setExpandedArchive}
          />
        </div>
      </div>
    </div>
  )
}
