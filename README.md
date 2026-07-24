# Quadracure Innovators — Demo Digitalization NATEC

Prototype web pour la présentation compétition :

**Client → IA → Ingénieur → Injection BFM Windows → Opérateur → Dataset production**

Le demo est conçu pour montrer un flux crédible et simple : le jury passe une commande, l'IA calcule les paramètres en ~3 secondes, l'ingénieur valide, les paramètres sont injectés vers la BFM, puis l'opérateur fait check-in/check-out sur tablette cleanroom.

## Lancer en local

```bash
cd quadracure-digitalization
npm install
npm run dev
```

Puis ouvrir l'URL affichée par Vite.

## Configuration Firebase temps réel

1. Créer un projet Firebase.
2. Activer **Firestore Database**.
3. Copier `.env.example` vers `.env`.
4. Remplir les variables `VITE_FIREBASE_*`.
5. Redémarrer `npm run dev`.

Si Firebase n'est pas configuré, l'app fonctionne quand même en **mode demo localStorage**.

## Configuration Gemini

Dans `.env` :

```bash
VITE_GEMINI_API_KEY=...votre clé...
VITE_GEMINI_MODEL=gemini-1.5-flash
```

Sans clé Gemini, le bouton IA utilise un moteur de calcul simulé pour garder la demo fluide.

> Pour une vraie production, ne pas exposer Gemini dans le navigateur : utiliser une Cloud Function ou un backend qui garde la clé API côté serveur.

## Firestore collections utilisées

- `orders` : commandes clients et paramètres IA/validés.
- `machineJobs` : jobs injectés vers la machine BFM.
- `shiftRecords` : check-in/check-out, output, défauts, yield.

## Parcours conseillé pendant la présentation

1. Page d'accueil → **Je suis Client**.
2. Le jury remplit une commande; un ID automatique est généré.
3. Revenir accueil → **Je suis Ingénieur**.
4. Sélectionner la commande en temps réel.
5. Cliquer **Calculer avec IA** : animation 3 secondes + paramètres.
6. Cliquer **Valider paramètres** puis **Injecter vers BFM**.
7. Revenir accueil → **Je suis Opérateur**.
8. Check-in badge, voir l'affichage tablette, puis check-out avec 5 mauvais ballons.
9. Montrer le rendement et le dataset qui servira à entraîner une IA plus avancée.
