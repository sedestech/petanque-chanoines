import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'; // Remplacez par votre URL
const supabaseKey = 'YOUR_PUBLIC_ANON_KEY'; // Remplacez par votre clé publique

export const supabase = createClient(supabaseUrl, supabaseKey);
