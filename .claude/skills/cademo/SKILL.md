---
name: cademo
description: Crée ou met à jour une vidéo de démonstration d'une fonctionnalité de l'app (landing, docs) avec cademo — un scénario Playwright rejouable, filmé et monté automatiquement (caméra, curseur, rythme, bulles). À utiliser quand on demande une vidéo de démo, une capture animée d'une fonctionnalité, ou de régénérer les vidéos après un changement d'interface.
---

# Vidéo de démo (cademo)

Une vidéo = un scénario Playwright dans le dossier des démos (`cademo.config.ts` → `demos`,
`demos/` par défaut), `demo('<id>', …)`. `bun run demo <id>` (= `cademo make <id>`) le joue, le
filme, le monte et écrit `<output>/<id>.mp4` et son poster `<id>.jpg`. Rien n'est retouché à la
main: pour changer la vidéo, on change le scénario, et on relance.

Lire `cademo.config.ts` d'abord: dossiers (`demos`, `output`, `workDir`), serveur, locale.
Si le projet n'a pas de `cademo.config.ts`: `bunx cademo init`.

Ce skill est fourni par cademo et remplacé à chaque mise à jour: ne pas le modifier dans le
projet. Ce qui est propre au projet (publication des vidéos, intégration dans l'app) est dans ses
propres consignes (`CLAUDE.md`, `AGENTS.md`…): les lire aussi, elles complètent celles-ci.

## 1. Storyboard — à valider avec l'utilisateur avant d'écrire du code

- Comprendre le produit (README, doc produit) et l'écran concerné; lire les tests e2e qui le
  pilotent: ils donnent les bons locators et les helpers de données.
- Proposer en quelques lignes: l'état de départ (page, données déjà présentes), 4 à 8 gestes,
  1 bulle au plus, le résultat visible à la fin.
- Une vidéo montre **une** fonctionnalité, 15–25 s. Données crédibles (vrais prénoms, pas « Test »).

## 2. Environnement (hors champ)

Tout ce qui précède `director.start()` n'est pas filmé: données, connexion, page de départ.

- Semer les données en base avec les helpers de test du projet plutôt que de les cliquer.
- Regrouper ce qui est propre aux démos (compte de démo, entité de départ) dans un fichier de
  fixtures à côté des démos (ex. `demos/fixtures.ts`), réutilisé d'une démo à l'autre.
- Repartir d'un état propre à chaque prise (supprimer puis recréer): les URL restent stables.
- Attendre que la page de départ soit prête (hydratée) avant `start()`.

## 3. Scénario

```ts
import { demo, expect } from 'cademo'

demo('create-team', async ({ page, director }) => {
	await page.goto('/teams') // hors champ
	await director.start()

	await director.click(page.getByRole('button', { name: 'Nouveau secteur' }))
	const drawer = page.getByRole('dialog', { name: 'Nouveau secteur' })
	await expect(drawer).toBeVisible()
	await director.type(drawer.getByLabel('Nom du secteur'), 'Bar principal')
	await director.click(drawer.getByRole('button', { name: 'Valider' }))
	await expect(drawer).toBeHidden()
	await director.pause(1500) // laisser voir le résultat
})
```

API `director` (chaque geste attend sa cible et la fait défiler en douceur si besoin):

| Geste                                                                              | Usage                                                                                        |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `click(loc, { note?, closeUp?, pause? })`                                          | déplace la souris puis clique; `closeUp: true` fait plonger la caméra sur ce clic (rarement) |
| `type(loc, texte, { cps?, clear? })`                                               | clique dans le champ et tape à cadence humaine                                               |
| `hover(loc)`, `press(touche)`, `select(loc, valeur)`, `scrollTo(loc)`, `pause(ms)` |                                                                                              |
| `note(loc, texte, { ms?, wait?, placement? })`                                     | bulle + halo sur la cible (1,7 s; la main repart après 1 s)                                  |
| `focus(loc \| null \| 'auto', { scale? })`                                         | impose le cadrage (`null` = vue entière) jusqu'au prochain `focus`                           |
| `skip(async () => …, { keep? })`                                                   | ramène un passage lent (chargement animé) à `keep` s                                         |
| `goto(url, { ready })`                                                             | navigation, chargement coupé                                                                 |
| `render({ … })`                                                                    | options de rendu propres à cette vidéo (`RenderOptions`)                                     |

Règles d'écriture:

- `expect(...)` entre les gestes pour attendre un état (volet ouvert, toast) — jamais `pause` pour
  attendre l'app.
- Ne **pas** régler les temps à la main (ni `pause` après chaque geste, ni durée de bulle): les
  valeurs par défaut portent le rythme. `pause(ms)` sert seulement à laisser voir un résultat.
- Une bulle (`note`) précède le geste qu'elle annonce, sur la même cible.
- Un chargement animé (spinner) n'est pas raccourci automatiquement: l'envelopper dans `skip()`.
- Locators accessibles (`getByRole`, `getByLabel`) comme dans les tests.

### Le rythme (enregistrement) — automatique

Entre deux gestes, l'enregistreur attend que l'écran ne bouge plus, puis laisse un souffle
(~0,2 s après un clic, ~0,1 s après une saisie): un geste sans effet visible enchaîne vite, un
clic qui ouvre un volet attend la fin de l'animation. L'image figée restante est coupée au
montage, seulement là où rien ne bouge (coupe invisible). Cible: **0,4–0,6 s entre la fin d'un
geste (ou de son animation) et le départ de la main suivante** — laisser respirer sans ennuyer.

### La caméra (montage) — automatique

1. **Un plan par contexte, pas par geste.** La caméra ne bouge que quand le geste suivant ne tient
   plus dans le cadre. Typiquement 3–5 plans pour 20 s.
2. **Zoom dosé**: ×1,2 à ×1,9, souvent ×1,4–1,5; en dessous, la vue entière. **Pas de gros plan
   automatique**: `closeUp: true` seulement pour un clic qui le mérite vraiment.
3. **Jamais un mouvement de caméra pendant une animation de l'interface** (volet, dialogue, page
   qui change): le clic qui la déclenche est filmé dans un plan déjà assez large pour contenir le
   volet en largeur.
4. **La caméra bouge avec la main**: un changement de plan démarre avec le mouvement de souris
   vers le geste suivant et dure à peu près autant. Avant une bulle, la caméra est déjà en place.
5. **Poussée discrète** (0,005/s). **Aucune coupe.** Ouverture et fin en vue entière.
6. **Le contexte reste dans le cadre**: le titre du volet, dialogue ou section du geste
   (`aria-labelledby`, sinon premier `h1`–`h4`/`legend` du conteneur) reste visible. Si un
   conteneur de l'app n'a pas de titre, le signaler: c'est aussi un défaut d'accessibilité.

Ces règles sont codées dans cademo (`src/render/camera.ts`, `src/record/director.ts`). Une
critique de l'utilisateur sur une vidéo doit devenir une **règle générale** de cademo, pas un
réglage propre à la vidéo; si le dépôt de cademo n'est pas accessible, la noter pour son auteur.

## 4. Enregistrer, revoir, retoucher

```sh
bun run demo <id>                # cademo make <id>: filme + rend + planche de revue
bun run demo <id> --no-record    # re-rend seulement
bun run demo                     # toutes les démos (après un changement d'UI)
bun run demo:edit <id>           # cademo edit <id>: éditeur de caméra
bunx cademo list                 # démos et leur état
```

Après chaque rendu, **lire `<workDir>/<id>/review.jpg`** (16 vignettes) et vérifier: le cadrage
suit l'action, aucun état parasite (spinner, toast d'erreur, popover resté ouvert), textes
lisibles, la fin montre le résultat. Pour un instant précis:
`ffmpeg -ss 4.2 -i <output>/<id>.mp4 -frames:v 1 /tmp/f.jpg`.

Si l'utilisateur a retouché la caméra dans l'éditeur (`<workDir>/<id>/camera.json`): comparer sa
piste à la piste automatique pour comprendre ce qu'il veut, et en tirer une règle (voir plus
haut) — sa piste ne survit pas à un nouvel enregistrement.

Diagnostics: `<workDir>/<id>/raw.mp4` montre où un scénario échoué s'est arrêté,
`<workDir>/test-results/` contient la trace Playwright, `frames.json` la cadence de capture
(moins de ~20 images/s pendant une saisie: le navigateur rame).

Enfin, montrer à l'utilisateur le chemin du MP4. La publication et l'intégration dans l'app
suivent les consignes du projet; s'il n'en a pas et que c'est une nouvelle vidéo, proposer de
l'intégrer là où l'app affiche ses démos.

## Options de rendu

`render` dans `cademo.config.ts` (toutes les vidéos) ou `director.render({…})` (une vidéo):
taille (1280×800 par défaut), `frame: 'none' | 'window'` (plein cadre, ou fenêtre de navigateur
sur fond dégradé), `maxZoom` (1,9), `closeUpZoom` (2,6), `displayOrigin` (origine affichée dans
la barre d'adresse en mode fenêtre).
