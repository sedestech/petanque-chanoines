import { supabase } from './supabaseClient';

/** 🔁 Liste tous les concours */
export async function getConcours() {
  const { data, error } = await supabase
    .from('concours')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw new Error('Erreur concours : ' + error.message);
  return data;
}

/** 🏆 Récupère un concours actif */
export async function getConcoursActif() {
  const { data, error } = await supabase
    .from('concours')
    .select('*')
    .eq('actif', true)
    .single();

  if (error) throw new Error('Erreur concours actif : ' + error.message);
  return data;
}

/** 📋 Récupère les résultats d’un concours */
export async function getResultats(concoursId) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('concours_id', concoursId);

  if (error) throw new Error('Erreur résultats : ' + error.message);
  return data;
}

/** ✏️ Met à jour les points d’un joueur */
export async function updateScore(resultId, newPoints) {
  const { error } = await supabase
    .from('results')
    .update({ points: newPoints })
    .eq('id', resultId);

  if (error) throw new Error('Erreur score : ' + error.message);
}

/** ➕ Ajoute un résultat */
export async function addResultat({ concours_id, joueur_id, points }) {
  const { error } = await supabase
    .from('results')
    .insert([{ concours_id, joueur_id, points }]);

  if (error) throw new Error('Erreur insertion : ' + error.message);
}
