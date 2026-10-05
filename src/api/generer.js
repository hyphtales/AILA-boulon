const MODELES_AUTORISES = [
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-haiku",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemini-2-flash-exp:free",
  "openai/gpt-4o",
  "anthropic/claude-3-5-sonnet-20241022",
];

const SYSTEM_PROMPT = `Tu es un développeur expert. Génère du code COMPLET, PROPRE et PRÊT À L'EMPLOI.
Réponds UNIQUEMENT avec le code HTML complet, sans explication.
Structure obligatoire :
- <!DOCTYPE html>
- <html lang="fr">
- <head> avec <meta charset>, <title>, <style> pour TOUT le CSS
- <body> avec le contenu
- <script> avant </body> pour le JavaScript
- Fermeture complète de tous les éléments
Le code doit être autonome, sans dépendance externe, responsive, moderne et fonctionnel.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const cle = process.env.OPENROUTER_API_KEY;
  if (!cle) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  const { prompt, modele } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 4000) {
    return res.status(400).json({ error: "Demande invalide (vide ou trop longue)" });
  }
  if (!MODELES_AUTORISES.includes(modele)) {
    return res.status(400).json({ error: "Modèle non autorisé" });
  }

  try {
    const reponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cle}`,
        "X-Title": "Mon Bolt Sans Défaut",
      },
      body: JSON.stringify({
        model: modele,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await reponse.json();
    if (!reponse.ok) {
      return res.status(reponse.status).json({ error: data.error?.message || "Erreur appel API" });
    }
    return res.status(200).json({ code: data.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + e.message });
  }
}
