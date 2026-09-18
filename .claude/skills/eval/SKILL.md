---
name: eval
description: Lance toute la suite (check, unit, e2e) après une modification manuelle, puis tranche pour chaque échec entre régression et test à mettre à jour. Rapport, propositions, question en cas de doute.
argument-hint: '[--fix] [--skip-e2e] [--only <fichier ou motif>]'
---

# /eval : juger l'état du working tree

Jonas a touché au code lui-même. Le but n'est pas de « faire passer les tests » mais de dire ce
que ses modifications ont changé, et si les tests qui tombent le font parce qu'ils sont devenus
faux ou parce que le code l'est devenu. Ses changements sont la référence, pas l'inverse :
voir la mémoire `user-manual-edits`. Ne jamais commiter.

Arguments : `$ARGUMENTS`

- `--fix` : appliquer sans demander les corrections dont le verdict est sûr (voir « Corriger »).
- `--skip-e2e` : s'arrêter après check et unit.
- `--only <motif>` : ne lancer que les tests qui correspondent (fichier, nom, `-g` Playwright).

## 1. Prendre la mesure du changement

Avant de lancer quoi que ce soit, lire ce qui a bougé : `git status --short`, `git diff --stat`,
puis `git diff` sur les fichiers modifiés (et le contenu des fichiers non suivis). Résumer en une
phrase par fichier **l'intention** que le diff laisse deviner. C'est cette intention qui servira à
trancher plus tard : un test qui contredit l'intention est obsolète, un test qui la confirme et
tombe quand même révèle une régression.

Si le working tree est propre, le dire et lancer la suite quand même : c'est alors l'état commité
qu'on évalue.

## 2. Lancer la suite dans l'ordre de la CI

Les trois étapes de `.github/workflows/deploy.yml`, dans le même ordre. Ne pas s'arrêter au
premier échec : un `svelte-check` rouge n'empêche pas les tests unitaires de renseigner.

```bash
bun run check                                   # svelte-kit sync + svelte-check --fail-on-warnings + lint
bun run test:unit                               # vitest run, environnement node
bunx playwright test --workers=1 --reporter=list   # e2e
```

Trois pièges propres à ce dépôt :

- **`--workers=1` est obligatoire** pour juger. En local `playwright.config.ts` laisse
  `workers: undefined` ; les tests partagent une base et un serveur, et en parallèle des étapes
  de préparation échouent au hasard (badge-repro, claim, emailVerification). Un échec qui
  disparaît en relançant le fichier seul n'est pas une régression.
- **`--reporter=list` est obligatoire**. Le rapporteur par défaut hors CI est `html` : en cas
  d'échec il sert le rapport et bloque le terminal jusqu'à Ctrl+C.
- **Un serveur `preview` déjà lancé sert un build périmé.** `reuseExistingServer` est vrai hors CI :
  si le port 4173 est occupé (`lsof -i :4173`), Playwright ne rebuilde pas et teste l'ancien code.
  Vérifier avant de lancer ; si un serveur tourne, le signaler à Jonas plutôt que de le tuer.

`bun run check` doit sortir à 0 erreur et 0 warning ; il n'y a pas de base de comparaison.
La suite e2e build puis preview : compter trois à cinq minutes. Utiliser un `timeout` large
(600000) ou `run_in_background`.

Si `--only` est donné, ne lancer que l'étape concernée : `vitest run <motif>` pour un fichier de
`src/tests/`, `bunx playwright test --workers=1 --reporter=list <motif>` pour `tests/`.

## 3. Trancher chaque échec

Pour chaque test rouge, dans cet ordre :

1. **Relancer le fichier seul.** Vert seul, rouge en suite : contention ou état partagé, pas une
   régression. Le noter comme « instable », sans proposer de modifier le code.
2. **Lire le test et le code qu'il exerce**, puis confronter au diff de l'étape 1.
   - Le diff contredit délibérément ce que le test affirme (un libellé renommé, un état ajouté,
     un comportement changé de propos délibéré) → **test à mettre à jour**. La preuve : on peut
     citer la ligne du diff qui explique la nouvelle valeur attendue.
   - Le diff ne touche pas ce que le test affirme, ou le touche par accident (un effet de bord,
     un import cassé, un cas oublié) → **régression**. La preuve : on peut nommer ce qui,
     dans le diff, casse le chemin, ou montrer que le diff ne visait pas ce chemin.
   - On ne trouve pas de lien entre le diff et l'échec → vérifier l'environnement (`.env`
     complet, base à jour : `bunx prisma migrate deploy`, `node_modules` à jour, `bun run generate`).
     Si l'environnement est sain, établir une base : demander avant de `git stash -u` (les
     fichiers non commités de Jonas n'ont pas d'autre copie), relancer le fichier, `git stash pop`.
     Rouge aussi sur la base → **préexistant**, à signaler sans le porter au compte du diff.
3. **Donner un niveau de confiance** : sûr, probable, doute. « Sûr » exige la preuve de l'étape 2.
   Tout ce qui repose sur une supposition d'intention est au mieux « probable ».

Un test qui tombe sur une valeur en dur (un texte français, un nombre de colonnes, un ordre) et
un diff qui change précisément cette valeur : c'est le cas le plus courant, et c'est un test à
mettre à jour. Mais un texte d'interface renommé touche parfois un sélecteur `getByRole` d'un
autre test : chercher toutes les occurrences avant de conclure.

## 4. Rendre compte

En français, court, avant toute modification. D'abord une ligne par étape (check / unit / e2e :
vert, ou N échecs). Puis une ligne par échec :

```
tests/plan.test.ts › Déplacer un créneau   régression, sûr
  movePeriod ne renvoie plus `team` (src/lib/period/period.remote.ts:48) ; la grille lit team.id.
  → restaurer le champ dans la réponse, ou adapter PlanGrid.svelte.

src/tests/log.test.ts › libellé de subscribe_state   test à mettre à jour, sûr
  Le diff renomme « Inscription validée » en « Inscription acceptée » (Log.svelte:112).
  → aligner l'attendu ligne 34.
```

Pour chaque proposition, dire ce qui serait modifié et où. Ne pas dérouler le diff complet
tant qu'il n'est pas demandé.

## 5. Corriger

- Verdict **sûr** : si `--fix` est présent, appliquer et relancer le test concerné ; sinon,
  proposer et attendre.
- Verdict **probable** ou **doute** : poser la question avec `AskUserQuestion`, une par échec,
  en offrant au minimum « mettre le test à jour », « corriger le code », « laisser ». Ne jamais
  décider seul entre les deux : dans un cas on efface une garantie, dans l'autre on annule un
  choix de Jonas.
- **Instable** ou **préexistant** : rien à corriger ici, le dire.

Toute correction se fait par remplacement ciblé (`Edit`), jamais par réécriture d'un fichier
que Jonas a pu toucher. Après correction, relancer uniquement les fichiers touchés, puis
`bun run check` si du code (pas seulement des tests) a changé. Laisser le tout dans le
working tree, sans commit.
