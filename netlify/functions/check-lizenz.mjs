/**
 * TGAassist Lizenz-Gate Proxy
 * Netlify Function: /api/check-lizenz
 *
 * Sitzt zwischen Base44-Frontend und Supabase-Edge-Function.
 * Das Shared Secret liegt NUR hier als Umgebungsvariable — nie im Browser.
 *
 * Deployment: netlify/functions/check-lizenz.mjs im Repo TWolff669/tgaassist-landingpage
 * Netlify Env Variable: TGA_SHARED_SECRET  (Wert aus Leitzcloud)
 */

export default async (req, context) => {
  // CORS-Preflight abhandeln
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }

  let email, app_code;
  try {
    ({ email, app_code } = await req.json());
  } catch {
    return new Response(JSON.stringify({ zugang: false, fehler: 'Ungültiger Request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  if (!email || !app_code) {
    return new Response(JSON.stringify({ zugang: false, fehler: 'email und app_code erforderlich' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const secret = process.env.TGA_SHARED_SECRET;
  if (!secret) {
    console.error('[check-lizenz] TGA_SHARED_SECRET nicht gesetzt');
    return new Response(JSON.stringify({ zugang: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  try {
    const supabaseRes = await fetch(
      'https://snazxvlswmtmwsddvtjm.supabase.co/functions/v1/pruefe-lizenz-extern',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tga-secret': secret,
        },
        body: JSON.stringify({ email, app_code }),
      }
    );

    if (!supabaseRes.ok) {
      console.error('[check-lizenz] Supabase Fehler:', supabaseRes.status);
      return new Response(JSON.stringify({ zugang: false }), {
        status: 200, // Absichtlich 200 – Frontend soll "kein Zugang" anzeigen, nicht crashen
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    const data = await supabaseRes.json();
    return new Response(JSON.stringify({ zugang: data.zugang ?? false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });

  } catch (err) {
    console.error('[check-lizenz] Netzwerkfehler:', err);
    return new Response(JSON.stringify({ zugang: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Base44-Apps haben wechselnde Preview-URLs; ggf. einschränken sobald Subdomains fix sind
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const config = { path: '/api/check-lizenz' };
