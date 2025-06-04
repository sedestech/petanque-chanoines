import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [score, setScore] = useState({ team_a: 0, team_b: 0, id: null });

  useEffect(() => {
    const loadScore = async () => {
      const { data } = await supabase.from('scores').select().limit(1).single();
      if (data) setScore(data);
    };
    loadScore();

    const channel = supabase
      .channel('realtime:scores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        (payload) => {
          if (payload.new) setScore(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateScore = async (team) => {
    const updated = {
      team_a: team === 'A' ? score.team_a + 1 : score.team_a,
      team_b: team === 'B' ? score.team_b + 1 : score.team_b,
    };
    await supabase.from('scores').update(updated).eq('id', score.id);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>🎯 Score Pétanque</h1>
      <p>Équipe A : {score.team_a}</p>
      <p>Équipe B : {score.team_b}</p>
      <button onClick={() => updateScore('A')}>+1 Équipe A</button>
      <button onClick={() => updateScore('B')}>+1 Équipe B</button>
    </div>
  );
}

export default App;
