---
name: integrate
description: Rapatrie le travail d'un ou plusieurs worktrees (`.claude/worktrees/*`) sur la branche `dev` : commite le reliquat, rebase sans commit de merge, vérifie avec check et unit, puis supprime le worktree et sa branche. Sans argument, liste les worktrees et demande lesquels intégrer. À utiliser dès que Jonas parle d'intégrer, rapatrier, merger, poser sur dev, finir ou nettoyer un worktree, une session worktree ou une branche `worktree-*`, même sans dire « worktree ».
argument-hint: '[worktree…]'
---

# /integrate : poser un worktree sur `dev`

Jonas travaille sur `dev` dans le checkout principal. Les sessions longues tournent dans des
worktrees et y commitent librement (exception écrite dans AGENTS.md). Ce skill termine le
cycle : le contenu du worktree arrive sur `dev` en **historique linéaire**, vérifié, et le
worktree disparaît. Hors de ce skill et des worktrees, la règle reste « ne jamais commiter ».

Arguments : `$ARGUMENTS` (fragments de nom, de chemin ou de branche ; vide = choisir).

Deux choses ne se négocient pas, parce qu'aucune ne se rattrape :

- **Le checkout principal doit être propre.** S'il porte la moindre modification, elle est à
  Jonas et n'a pas d'autre copie : on l'avertit et on s'arrête (étape 0). Jamais de stash,
  d'autostash, de checkout ou de reset pour contourner.
- **Jamais de push, jamais de `--force`** (ni `worktree remove --force`, ni `branch -D`). Leurs
  refus sont précisément les garde-fous qui signalent du travail non rapatrié.

## 0. Repérer

```bash
git worktree list --porcelain
```

Le premier bloc est le checkout principal. Deux conditions, vérifiées avant toute autre chose :

- il est sur `dev`, sinon le skill ne sait pas où Jonas veut poser le travail ;
- `git -C <principal> status --short` est vide, fichiers non suivis compris.

Si l'une manque, **avertir et s'arrêter là** : nommer la branche ou lister les fichiers, et ne
rien faire d'autre, pas même commiter ou rebaser un worktree. Jonas range son principal lui-même,
puis relance `/integrate`.

Toutes les commandes passent par `git -C <chemin>` : la session peut tourner dans le principal
comme dans un worktree, et les refs (`dev`, les branches) sont partagées entre tous.

## 1. Choisir

Avec un argument, retrouver le ou les worktrees qui correspondent (nom de dossier, chemin ou
branche). Ambigu ou introuvable : montrer la liste et demander.

Sans argument, présenter un tableau de tous les worktrees hors principal :

| worktree | branche | avance / retard sur dev | fichiers sales | dernière activité |
| -------- | ------- | ----------------------- | -------------- | ----------------- |

```bash
git rev-list --left-right --count dev...<branche>   # retard, avance
git -C <wt> status --short | wc -l
git -C <wt> log -1 --format=%cr
```

Puis `AskUserQuestion` : « Tous » ou « Une sélection ». Pour une sélection, une question
multiSelect s'il y a au plus quatre worktrees, sinon demander les noms en texte.

Deux cas à signaler dans le tableau plutôt qu'à découvrir en route :

- **Rien à intégrer** (propre, aucune avance sur `dev`) : proposer seulement la suppression.
- **Session peut-être encore active** (`ListAgents` montre une session dans ce dossier, ou des
  fichiers modifiés il y a quelques minutes) : avertir avant d'y commiter quoi que ce soit, car on
  couperait l'herbe sous le pied d'un travail en cours.

Les worktrees retenus se traitent **l'un après l'autre**, chacun rebasé sur le `dev` laissé par
le précédent. Un échec sur l'un n'empêche pas les suivants : le laisser en place, le noter pour le
rapport, continuer.

## 2. Nettoyer le worktree

Lire `git -C <wt> status --short`, le diff et le contenu des fichiers non suivis. Le but est de
commiter le travail de la session, pas tout ce qui traîne : écarter les sorties de build, logs,
vidéos générées, fichiers temporaires. En cas de doute sur un fichier, demander plutôt que de
l'embarquer.

Commiter dans le style du dépôt (`git log --format=%s -20` pour s'en imprégner) : anglais,
`scope: description` en minuscules, plusieurs scopes séparés par des virgules (`plan, e2e: …`).
Si le diff porte plusieurs intentions distinctes, faire plusieurs commits. Aucun trailer
`Co-Authored-By` (`attribution.commit` est vide dans les réglages du projet).

## 3. Rebaser sur `dev`

```bash
git -C <wt> rebase dev
```

Pas de merge : Jonas veut un historique linéaire où chaque commit du worktree reste lisible.

En cas de conflit, la tentation est de choisir un côté. Le plus souvent, il faut **composer** :
les deux côtés ont fait quelque chose de voulu. Pour chaque fichier en conflit :

1. Lire ce que `dev` a fait (`git log dev -- <fichier>`, puis `git show` du commit concerné) et ce
   que le commit du worktree en cours de rejeu voulait faire.
2. Écrire la version qui réalise les deux intentions. Si elles se contredisent vraiment, ou si
   l'une des deux n'est pas claire, demander avec `AskUserQuestion` en résumant chaque côté.
3. `git -C <wt> add <fichier>`, puis `GIT_EDITOR=true git -C <wt> rebase --continue`.

Garder la liste des fichiers en conflit et une phrase sur la façon dont chacun a été tranché :
elle sert à décider de l'e2e (étape 4) et au rapport. Si la situation devient confuse,
`git -C <wt> rebase --abort` ramène exactement à l'état d'avant.

Cas propre au dépôt : si `dev` et le worktree ont chacun ajouté une migration dans
`prisma/migrations/`, le rebase ne signale aucun conflit mais l'ordre des horodatages peut ne plus
correspondre à l'ordre d'application voulu. Le vérifier et le signaler.

## 4. Vérifier, dans le worktree

On vérifie **avant** de toucher `dev`, dans le worktree, qui a son propre `node_modules` et son
`.env` : si quelque chose casse, `dev` n'a pas bougé.

Si `package.json` ou `bun.lock` a changé d'un côté ou de l'autre, `bun install` d'abord ; si
`prisma/schema.prisma` a changé, `bun run generate`. Puis, depuis le worktree :

```bash
bun run check        # 0 erreur, 0 warning attendus
bun run test:unit
```

Les deux tournent **à chaque intégration**, conflit ou non : un rebase textuellement propre peut
casser sémantiquement (une fonction renommée sur `dev`, encore appelée par le worktree).

Un échec dû à l'intégration se corrige par un commit dans le worktree, dont le message nomme ce
qui est réparé (pas « fix after rebase »), puis on relance. Un échec qui existe déjà
sur `dev` n'est pas à mettre au compte du worktree : le dire, ne pas le corriger ici.

### L'e2e, seulement en cas de gros doute

La suite e2e prend plusieurs minutes. Elle ne se lance que si check et unit ne peuvent pas
trancher, c'est-à-dire quand une résolution de conflit a :

- fusionné deux changements de **comportement** dans du code d'exécution (remote functions,
  middleware Prisma, permissions, grille du planning, tâches planifiées) ;
- touché `prisma/schema.prisma` ou des migrations des deux côtés ;
- touché `playwright.config.ts`, `tests/seed.ts` ou une autre fixture de `tests/` ;
- porté sur une zone qu'aucun test unitaire n'exerce, avec une composition non triviale.

Un conflit d'imports, de formatage ou de texte ne justifie pas l'e2e. Quand il se justifie,
lancer d'abord les specs qui couvrent la zone, et la suite complète seulement si le doute est
large (l'annoncer, avec sa durée) :

```bash
lsof -i :4173        # un preview déjà lancé servirait un build périmé : le signaler, ne pas le tuer
bunx playwright test --workers=1 --reporter=list <spec>
```

`--workers=1` parce qu'en parallèle des tests tombent au hasard ; `--reporter=list` parce que le
rapporteur html bloque le terminal en cas d'échec.

## 5. Poser sur `dev`

Revérifier que le principal est toujours propre (Jonas a pu y toucher pendant la vérification) ;
sinon, avertir et s'arrêter comme à l'étape 0, le worktree restant rebasé et vérifié. Puis :

```bash
git -C <principal> merge --ff-only <branche>
```

L'avance rapide ne crée aucun commit. Si elle refuse parce que `dev` a avancé entre-temps (Jonas
a commité), revenir à l'étape 3.

## 6. Supprimer

Une fois le contenu sur `dev` (`git merge-base --is-ancestor <branche> dev`) :

```bash
git worktree remove <chemin>
git branch -d <branche>
```

Sans `--force`, `worktree remove` refuse s'il reste des fichiers non suivis non ignorés, et
`branch -d` refuse si un commit manque sur `dev` : dans les deux cas, c'est qu'un bout de travail
n'a pas été rapatrié. Regarder ce qui reste plutôt que forcer.

Si la session courante tourne dans ce worktree, supprimer le dossier sous ses pieds la casserait.
`ExitWorktree` avec `action: "remove"` en sort proprement, mais seulement si c'est elle qui l'a
ouvert (`EnterWorktree`) ; sinon il ne fait rien. À défaut, laisser la suppression à Jonas et lui
donner les deux commandes à lancer depuis le principal.

## 7. Rendre compte

En français, court. Par worktree :

```
demos (demos-storyboards) → dev   intégré, worktree et branche supprimés
  3 commits : a1b2c3d demos: …, …
  conflits : playwright.config.ts (gardé le timeout de dev et le projet demos du worktree)
  check ✓  unit ✓  e2e : tests/demos.test.ts ✓ (conflit sur la config Playwright)

comments (comments-cleanup)   arrêté avant dev, rebasé et vérifié
  le principal n'est plus propre (eslint.config.js modifié) : relance /integrate comments
  une fois rangé.
```

Rien n'est poussé : le dire si Jonas pourrait s'y attendre.
