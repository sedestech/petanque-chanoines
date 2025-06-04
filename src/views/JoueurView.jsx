import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'

export default function JoueurView({ concours, equipes, setCurrentView }) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView('home')}>← Retour</Button>
          <h1 className="text-xl font-bold">Classement</h1>
          <div></div>
        </div>
        {!concours ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Aucun concours en cours</p>
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
                          <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{equipe.nom}</p>
                            <p className="text-sm text-muted-foreground">{equipe.joueurs.join(', ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{equipe.victoires} pts</p>
                          <p className="text-sm text-muted-foreground">{equipe.points} buts</p>
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
}
