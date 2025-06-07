
import { useState } from 'react'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Trophy } from 'lucide-react'

function PartieCard({ partie, onEnregistrerScore }) {
  const [score1, setScore1] = useState(partie.score1 === 0 ? '' : partie.score1.toString())
  const [score2, setScore2] = useState(partie.score2 === 0 ? '' : partie.score2.toString())

  const handleEnregistrer = () => {
    onEnregistrerScore(partie.id, score1, score2)
  }


  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Partie {partie.numero}</h3>
        <Badge variant={partie.statut === 'terminee' ? 'default' : 'outline'}>
          {partie.statut === 'terminee' ? 'Terminée' : 'En cours'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="text-center">
          <p className="font-medium text-sm">{partie.equipe1.nom}</p>

          <div className="text-xs text-muted-foreground">{partie.equipe1.joueurs.join(', ')}</div>

        </div>
        <div className="text-center">
          <p className="text-lg font-bold">VS</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">{partie.equipe2.nom}</p>

          <div className="text-xs text-muted-foreground">{partie.equipe2.joueurs.join(', ')}</div>

        </div>
      </div>

      {partie.statut === 'terminee' ? (
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{partie.score1}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Score final</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{partie.score2}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 items-center">

            <Input type="number" placeholder="Score" value={score1} onChange={(e) => setScore1(e.target.value)} min="0" />
            <div className="text-center text-sm text-muted-foreground">Scores</div>
            <Input type="number" placeholder="Score" value={score2} onChange={(e) => setScore2(e.target.value)} min="0" />
          </div>

          <Button onClick={handleEnregistrer} className="w-full" disabled={!score1 || !score2}>
            <Trophy className="w-4 h-4 mr-2" />
            Enregistrer le score
          </Button>
        </div>
      )}
    </div>

  )
}


export default PartieCard

