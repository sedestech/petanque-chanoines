# Pétanque Chanoines — Application de Concours

Application React + Supabase pour gérer des concours de pétanque en ligne avec score **temps réel** multi-utilisateur.

## 🚀 Fonctionnalités

- Affichage des scores (Équipe A / B)
- Mise à jour en direct avec Supabase Realtime
- Déploiement Vercel-ready
- Prévue pour GitHub

## ⚙️ Déploiement

1. Clone ce repo ou uploade sur GitHub
2. Connecte-le à [Vercel](https://vercel.com/import)
3. Configure Supabase :
   - Table `scores` avec `id`, `team_a`, `team_b`
   - Active les règles de lecture/écriture

4. Renseigne ton `supabaseUrl` et `supabaseKey` dans `src/supabaseClient.js`

## 🧩 Technologies

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
