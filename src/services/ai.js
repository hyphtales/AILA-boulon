const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MODELES = [
  { id: "openai/gpt-4o-mini", nom: "GPT-4o Mini", gratuit: true },
  { id: "anthropic/claude-3.5-haiku", nom: "Claude 3.5 Haiku", gratuit: true },
  { id: "meta-llama/llama-3.1-8b-instruct:free", nom: "Llama 3.1 8B", gratuit: true },
  { id: "google/gemini-2-flash-exp:free", nom: "Gemini 2 Flash", gratuit: true },
  { id: "openai/gpt-4o", nom: "GPT-4o", gratuit: false },
  { id: "anthropic/claude-3-5-sonnet-20241022", nom: "Claude 3.5 Sonnet", gratuit: false },
];

export async function genererCode(prompt, apiKey, modeleId) {
  const systemPrompt = `Tu es un développeur expert. Génère du code COMPLET, PROPRE et PRÊT À L'EMPLOI.

Réponds UNIQUEMENT avec le code HTML complet, sans explication.
Structure obligatoire :
- <!DOCTYPE html>
- <html lang="fr">
- <head> avec <meta charset>, <title>, <style> pour TOUT le CSS
- <body> avec le contenu
- <script> avant </body> pour le JavaScript
- Fermeture complète de tous les éléments

Le code doit être autonome, sans dépendance externe, responsive, moderne et fonctionnel.`;

  const reponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Mon Bolt Sans Défaut"
    },
    body: JSON.stringify({
      model: modeleId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    })
  });

  if (!reponse.ok) {
    const err = await reponse.json();
    throw new Error(err.error?.message || "Erreur appel API");
  }

  const data = await reponse.json();
  return data.choices[0].message.content;
}
