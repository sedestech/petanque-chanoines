import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Users, Plus, Edit, Trash2 } from 'lucide-react'

export default function JoueursView({
  joueurs,
  newJoueur,
  setNewJoueur,
  ajouterJoueur,
  editingJoueur,
  setEditingJoueur,
  modifierJoueur,
  supprimerJoueur,
  setCurrentView,
}) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView('admin')}>← Retour</Button>
          <h1 className="text-xl font-bold">Gestion des Joueurs</h1>
          <Users className="w-6 h-6 text-primary" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" /> Ajouter un joueur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pseudo">Pseudo</Label>
              <Input
                id="pseudo"
                placeholder="Nom du joueur..."
                value={newJoueur.pseudo}
                onChange={(e) => setNewJoueur({ ...newJoueur, pseudo: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && ajouterJoueur()}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="paye" checked={newJoueur.paye} onCheckedChange={(c) => setNewJoueur({ ...newJoueur, paye: c })} />
                <Label htmlFor="paye">A payé</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="arbitre" checked={newJoueur.arbitre} onCheckedChange={(c) => setNewJoueur({ ...newJoueur, arbitre: c })} />
                <Label htmlFor="arbitre">Arbitre</Label>
              </div>
            </div>
            <Button onClick={ajouterJoueur} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Ajouter
            </Button>
          </CardContent>
        </Card>
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
                        <Button size="sm" variant="outline" onClick={() => setEditingJoueur(joueur)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => supprimerJoueur(joueur.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        {editingJoueur && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Modifier {editingJoueur.pseudo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-pseudo">Pseudo</Label>
                <Input id="edit-pseudo" value={editingJoueur.pseudo} onChange={(e) => setEditingJoueur({ ...editingJoueur, pseudo: e.target.value })} />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-paye" checked={editingJoueur.paye} onCheckedChange={(c) => setEditingJoueur({ ...editingJoueur, paye: c })} />
                  <Label htmlFor="edit-paye">A payé</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="edit-arbitre" checked={editingJoueur.arbitre} onCheckedChange={(c) => setEditingJoueur({ ...editingJoueur, arbitre: c })} />
                  <Label htmlFor="edit-arbitre">Arbitre</Label>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => modifierJoueur(editingJoueur.id, editingJoueur)} className="flex-1">
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={() => setEditingJoueur(null)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
