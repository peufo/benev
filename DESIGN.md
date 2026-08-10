---
name: benevio
description: Plateforme de gestion de bénévoles pour associations, festivals et collectifs
colors:
  primary: '#2663eb'
  primary-content: '#ffffff'
  secondary: '#11b981'
  secondary-content: '#1f2937'
  accent: '#e69214'
  accent-content: '#1f2937'
  neutral: '#2b3440'
  neutral-content: '#d7dde4'
  base-100: '#ffffff'
  base-200: '#f2f2f2'
  base-300: '#e5e6e6'
  base-content: '#1f2937'
typography:
  display:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 'clamp(1.875rem, 4vw, 3rem)'
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: '6px'
  md: '8px'
  lg: '16px'
  full: '9999px'
spacing:
  page-x: '16px'
  section-y: '80px'
  card-body: '32px'
  component-gap: '16px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-content}'
    rounded: '{rounded.md}'
    padding: '0px 16px'
    size: '14px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.base-content}'
    rounded: '{rounded.md}'
    padding: '0px 16px'
  card:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.lg}'
    padding: '{spacing.card-body}'
  input:
    backgroundColor: '{colors.base-100}'
    textColor: '{colors.base-content}'
    rounded: '{rounded.md}'
    padding: '0px 12px'
    height: '40px'
---

# Design System: benevio

## 1. Overview

**Creative North Star: "Le carnet de bord bien tenu"**

benevio est un outil de gestion de bénévoles pensé comme un carnet de bord: clair, structuré, sans fioriture. L'interface ne cherche pas à impressionner par des effets visuels; elle gagne la confiance par l'ordre, la lisibilité et la chaleur discrète. Chaque écran doit donner l'impression que quelqu'un a déjà fait le tri et mis les bonnes informations au bon endroit.

L'atmosphère est **franche et utile**. On évite le ton corporate (« transformez votre workflow »), les illustrations 3D stériles, les grilles de cartes identiques et les gradients agressifs. On parle à des bénévoles pressés, pas à des chefs d'entreprise. La transparence open source est un atout visuel: le design doit sentir l'outil accessible et le service honnête.

### Source de vérité

Le thème est défini **dans `src/app.css`**, via le bloc `@plugin 'daisyui/theme'` de **Tailwind CSS v4 + DaisyUI v5**. Il n'y a ni `tailwind.config.mjs`, ni `postcss.config.cjs`, ni `theme.extend.colors`: toute la configuration visuelle est du CSS.

```css
@plugin 'daisyui' { logs: false; themes: light --default; }
@plugin 'daisyui/theme' { name: 'light'; ... }
```

Un seul thème est déclaré (`light`), rendu par défaut. Les composants n'utilisent que les classes sémantiques DaisyUI (`btn-primary`, `card`, `input`, `badge-success`) et les utilitaires Tailwind adossés aux mêmes tokens (`bg-secondary/10`, `text-base-content/70`, `border-soft`). **Les valeurs hex de ce document sont une transcription du thème, pas une source à recopier.**

**Key Characteristics:**

- Une seule police, Barlow, porte toute la hiérarchie par le poids et la taille.
- Le bleu franc (`primary`) est l'accent principal et porte l'action; il est présent mais jamais étouffant.
- Le vert (`secondary`) est la couleur de la marque — c'est le point du logo. Il porte l'atmosphère, la confirmation et le dégradé de page.
- L'orange (`accent`) est un marqueur fonctionnel rare, réservé au repérage temporel des plannings.
- Le bleu et le vert sont les deux couleurs du logo; la charte ne fait que prolonger la marque à l'écran.
- Les surfaces sont planes par défaut; les ombres apparaissent seulement sur les cards, la navigation et les éléments interactifs majeurs.
- Les coins sont arrondis de manière modérée: 8px pour les boutons et champs, 16px pour les cards et la navbar.

## 2. Colors

La palette est volontairement resserrée et sort directement du logo: un bleu qui porte l'action, un vert qui signe la marque, un orange de repérage, et des neutres quasi purs. **Toutes les couleurs viennent du thème DaisyUI de `src/app.css` — il n'existe aucune couleur de marque en dehors de lui.**

Bleu et vert sont deux teintes claires (L≈55% et L≈70% en OKLCH). Elles se tiennent en aplat, mais aucune des deux n'a la réserve de contraste de l'ancien bleu ardoise: les règles ci-dessous encadrent précisément ce que chacune peut porter.

### Tokens du thème

| Token               | Valeur    | Rôle                                                                                                                                                                                                      |
| ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary`           | `#2663eb` | Bleu franc. Couleur d'action: titres, boutons principaux, liens actifs, étapes franchies. Contraste 5.16:1 sur `base-100`.                                                                                |
| `primary-content`   | `#ffffff` | Texte sur fond `primary`. Contraste 5.16:1.                                                                                                                                                               |
| `secondary`         | `#11b981` | Vert. Couleur de marque (le point du logo): aplats de confirmation, fonds `secondary/5`–`secondary/10`, bordures `secondary/20`, dégradé de page, pastilles. **2.54:1 sur `base-100` — jamais en texte.** |
| `secondary-content` | `#1f2937` | Texte sur fond `secondary`. Contraste 5.79:1.                                                                                                                                                             |
| `accent`            | `#e69214` | Orange. Marqueur de position temporelle dans les plannings (`bg-accent` en filet de 3px, `hover:bg-accent/5`). **2.47:1 sur `base-100` — jamais en texte.**                                               |
| `accent-content`    | `#1f2937` | Texte sur fond `accent`. Contraste 5.93:1.                                                                                                                                                                |
| `neutral`           | `#2b3440` | Gris ardoise. Textes d'aide discrets (`label-text-alt`).                                                                                                                                                  |
| `neutral-content`   | `#d7dde4` | Texte sur fond `neutral`. Contraste 9.20:1.                                                                                                                                                               |
| `base-100`          | `#ffffff` | Surfaces: cards, navbar, champs, modales.                                                                                                                                                                 |
| `base-200`          | `#f2f2f2` | Fond de hover léger, fond d'application (`bg-base-200/20`), lignes alternées.                                                                                                                             |
| `base-300`          | `#e5e6e6` | État actif (`menu-item.active` via `base-300/80`), séparateurs appuyés.                                                                                                                                   |
| `base-content`      | `#1f2937` | Texte principal. Contraste 14.68:1 sur `base-100`.                                                                                                                                                        |

`info`, `success`, `warning` et `error` ne sont pas redéfinis: ils sont hérités des valeurs par défaut de DaisyUI v5 et servent uniquement de signaux d'état (`badge-success`, `badge-warning`, `--color-error` sur les champs invalides).

### Utilitaires de bordure

Deux utilitaires dérivent la bordure de `base-content` plutôt que d'introduire une couleur:

- **`.border-soft`** — `color-mix(in oklab, var(--color-base-content) 18%, #0000)`. Bordure par défaut des cards internes, champs, encarts, séparateurs.
- **`.border-hard`** — `color-mix(in oklab, var(--color-base-content) 40%, #0000)`. Bordure des conteneurs qui doivent tenir seuls: card principale, pied de page.

### Named Rules

**The Theme-Only Rule.** Aucune couleur ne vit en dehors de `src/app.css`. Pas de hex en dur (`bg-[#2663eb]`), pas de palette Tailwind brute (`text-slate-700`, `bg-green-500`), pas d'ajout dans un fichier de config. On utilise `primary`, `secondary`, `accent`, `neutral`, `base-*`, les états DaisyUI et leurs variantes d'opacité (`/5`, `/10`, `/20`, `/40`, `/70`). S'il manque une couleur, on l'ajoute au bloc `@plugin 'daisyui/theme'`.

Deux fichiers échappent au thème par nécessité: les logos `src/lib/assets/logo.svg`, `src/lib/assets/benevio.svg` et `static/favicon.svg` sont servis en `<img>` et ne peuvent pas hériter de `currentColor`. Leurs hex sont donc écrits en dur et **doivent être tenus à jour avec `primary` et `secondary`**. Quand la marque est rendue inline dans un composant Svelte, elle repasse par `text-primary` / `text-secondary` et `currentColor`.

**The One Accent Rule.** Le bleu (`primary`) porte l'action et reste l'accent dominant de la plupart des écrans. Le vert (`secondary`) porte la marque, l'atmosphère et la confirmation — il peut prendre un aplat, mais il ne dispute jamais au bleu l'action principale d'un écran: deux boutons pleins de couleurs différentes côte à côte, c'est une hiérarchie ratée. L'orange (`accent`) est réservé au repérage temporel des plannings; il ne devient pas un accent décoratif ailleurs.

**The Chromatic-Never-Reads Rule.** Ni `secondary` (2.54:1 sur `base-100`) ni `accent` (2.47:1) ne portent du texte: pas de `text-secondary` ni de `text-accent` sur une phrase à lire, pas d'icône seule porteuse d'information dans ces teintes. Ils fonctionnent comme fond, aplat, bordure, pastille ou trait. En aplat plein, leur texte est `secondary-content` / `accent-content` — l'encre `#1f2937`, qui remonte à 5.79:1 et 5.93:1. `badge-secondary badge-outline` sur `base-100` reste légitime: c'est le contour qui porte la couleur, pas la lecture.

**The /70 Floor Rule.** Le texte atténué descend à `base-content/70` (5.54:1) au plus bas. `base-content/60` tombe à 4.04:1 et échoue AA sur du texte courant; on le réserve aux libellés non essentiels en gras (`.title-sm`), là où l'information est aussi portée ailleurs. La règle vaut aussi pour `primary`: à 5.16:1 le bleu n'a plus la réserve de l'ancien bleu ardoise (11.45:1), donc **`text-primary` ne s'atténue pas** — `text-primary/70` tombe à 2.68:1.

## 3. Typography

**Display & Body Font:** Barlow (400, 500, 600, 700, 800), chargée depuis Google Fonts dans `src/app.html`, avec `system-ui, -apple-system, BlinkMacSystemFont, sans-serif` en repli.

Barlow est une sans-serif humaniste géométrique: elle a la clarté d'une interface et la chaleur d'une forme ouverte. Une seule famille porte tout le système. La hiérarchie se lit dans le contraste de poids et d'échelle, pas dans un changement de police.

### Hierarchy

- **Display** (800, `clamp(2.25rem, 5vw, 3.75rem)`, line-height 1.05, letter-spacing -0.025em): titre de hero. Un seul par page.
- **Headline** (700, `clamp(1.875rem, 4vw, 3rem)`, line-height 1.1): titres de section (« Comment ça marche », « Mes demandes »).
- **Title** (600, 1.25rem, line-height 1.4): titres de cards, sous-sections. Disponible en classe utilitaire `.title` (avec `text-base-content/70`).
- **Body** (400, 1rem, line-height 1.5): paragraphes, descriptions, contenu de formulaire. Longueur de ligne max ~75ch.
- **Label** (500, 0.875rem, line-height 1.25): libellés de champs, badges, métadonnées.

Trois classes utilitaires vivent dans `src/app.css` et complètent l'échelle: `.title` (xl / 600 / `base-content/70`), `.title-md` (base / 600 / `base-content/60`), `.title-sm` (xs / 700 / `base-content/60`).

### Named Rules

**The Weight Contrast Rule.** Ne pas créer de tailles intermédiaires plates. Sauter d'au moins un poids (400 → 600 → 700/800) et d'au moins 1.25× en taille entre deux niveaux de hiérarchie.

## 4. Elevation

Le système est **plat par défaut, soulevé avec intention**. La profondeur n'est pas décorative: elle signale l'interactivité ou délimite une surface. Le fond d'application est `bg-base-200/20`, recouvert sur les pages publiques d'un dégradé descendant `from-secondary/10 via-secondary/5 to-transparent`.

### Shadow Vocabulary

- **`shadow-lg`** — ombre des cards et de la navbar. C'est l'élévation par défaut des surfaces qui portent du contenu.
- **`shadow-xl`** — élévation au hover des CTA, et des surfaces flottantes (dropdowns, modales).
- **`shadow-sm`** — détachement minimal, réservé aux éléments denses en liste.

### Named Rules

**The Purposeful Lift Rule.** Une ombre ne justifie sa place que si elle guide l'œil vers une action ou délimite une surface cliquable. Pas d'ombres sur du texte statique ou des conteneurs purement informatifs. On utilise les utilitaires Tailwind (`shadow-sm`, `shadow-lg`, `shadow-xl`) plutôt que des valeurs d'ombre écrites en dur.

**The No-Nested-Card Rule.** Une card ne contient jamais une autre card. Un composant réutilisable susceptible d'être monté dans une card (`Login`, les formulaires d'étape de `Register`) ne fournit pas sa propre surface: il lit le contexte `contextContainer` de `$lib/fuma-legacy` et se rend nu quand il est déjà porté.

## 5. Components

Tous les composants s'appuient sur DaisyUI v5 et sur la bibliothèque `fuma` (liée en local). Les classes utilitaires Tailwind ajustent l'espacement, la typographie et les cas particuliers. Aucune valeur de couleur ou de rayon n'est écrite en dur.

### Buttons

- **Shape:** `rounded-lg` (8px) hérité de DaisyUI, hauteur implicite.
- **Primary:** `btn btn-primary` — fond `primary`, texte `primary-content`. C'est l'action unique et principale d'un écran ou d'un formulaire.
- **Neutral / secondaire:** `btn` — la valeur par défaut de DaisyUI. Toute action qui n'est pas *l'*action.
- **Ghost:** `btn btn-ghost` — sans fond, pour les actions de service (fermer, revenir, basculer).
- **Outline:** `btn btn-outline border-soft` — les bordures de boutons passent par `border-soft` pour rester alignées avec les cards.
- **Icon leading:** icônes Lucide (`@lucide/svelte`, 16–22px), alignées via le `gap` natif de `btn`.

### Cards / Containers

- **Composant:** `Card` de `$lib/fuma-legacy` — `card border border-hard bg-base-100 shadow-lg`, corps `card-body rounded-b-2xl p-2 sm:p-8`.
- **Corner Style:** `rounded-2xl` (16px).
- **Background:** `base-100`.
- **Border:** `border-hard` sur la card autonome, `border-soft` sur les encarts internes.
- **Encart interne:** `border border-soft rounded-2xl p-5` — c'est la forme d'un bloc secondaire _dans_ une card, pas une card imbriquée.

### Inputs / Fields

- **Composants:** `InputString`, `InputTextarea`, `InputBoolean`, `InputSelect` de `fuma`, adossés aux `RemoteFormField` de SvelteKit.
- **Variante par défaut:** `variant="block"` — libellé au-dessus du champ dans un `fieldset.fieldset`. C'est la variante des formulaires du produit; `floating` (défaut de la lib) est réservée aux barres compactes et aux filtres.
- **Style:** fond `base-100`, bordure DaisyUI, coins `rounded-lg` (8px), hauteur 40px.
- **Focus:** anneau `primary` fourni par DaisyUI.
- **Error:** `--input-color: var(--color-error)` posé par le sélecteur `aria-invalid`, et messages rendus par `Issues`.

### Navigation

- **Header:** `flex p-2 rounded-b-xl bg-base-100 shadow-lg border-soft border-b border-x`, dans un conteneur `px-2 md:px-4` — la barre ne touche pas les bords de l'écran.
- **Links:** `link link-hover` de DaisyUI. Pas de soulignement permanent.
- **Menu items:** `.menu-item` (classe custom dans `app.css`) avec icône Lucide 20px à gauche, fond `base-200` au hover, `base-300/80` quand actif.
- **Steps:** `steps` / `step` / `step-primary` de DaisyUI pour les parcours en plusieurs étapes (inscription à un événement).

### Signature Component: Trust Band

Bande horizontale pleine largeur, fond `bg-secondary/5`, bordures `border-y border-secondary/20`, contenu centré en `py-6`. Elle porte les preuves de confiance (open source, gratuit, personnalisable) sous forme de petites pastilles suivies d'un mot. C'est le moment où le design dit « tu peux y aller » sans être tape-à-l'œil.

Les pastilles sont **toutes `bg-secondary`**. La couleur n'encode rien ici — les trois affirmations sont indépendantes, pas des catégories: trois teintes différentes inventeraient une taxonomie qui n'existe pas.

## 6. Do's and Don'ts

### Do:

- **Do** définir toute couleur dans le bloc `@plugin 'daisyui/theme'` de `src/app.css`.
- **Do** utiliser `primary`, `secondary`, `accent`, `neutral`, `base-*`, les états DaisyUI et leurs variantes d'opacité.
- **Do** utiliser `border-soft` / `border-hard` plutôt que `border-base-300` ou une couleur de bordure choisie au cas par cas.
- **Do** utiliser Barlow pour tout le texte, de l'UI au marketing.
- **Do** passer `variant="block"` aux champs `fuma` dans les formulaires.
- **Do** laisser beaucoup d'air autour des sections (`py-20 md:py-28` en hero, `py-12 md:py-20` en contenu).
- **Do** préférer des icônes Lucide fines et simples aux icônes MDI chargées.
- **Do** utiliser `secondary` comme fond, aplat, bordure ou pastille — jamais comme texte.
- **Do** tenir les hex des logos SVG (`logo.svg`, `benevio.svg`, `favicon.svg`) alignés sur `primary` et `secondary`.

### Don't:

- **Don't** écrire de valeurs hex en dur dans les composants (ex: `bg-[#2663eb]`).
- **Don't** utiliser la palette Tailwind brute (`slate`, `red`, `emerald`…): elle court-circuite le thème. `bg-green-500` est d'autant plus inutile que `secondary` _est_ le vert.
- **Don't** écrire de valeurs de rayon, d'ombre ou d'espacement en dur si un token Tailwind ou DaisyUI existe.
- **Don't** imbriquer une card dans une card, ni faire porter sa propre surface à un composant montable.
- **Don't** utiliser `text-secondary` (2.54:1) ni `text-accent` (2.47:1) sur du texte à lire: sous le seuil AA.
- **Don't** descendre le texte atténué sous `base-content/70`, ni atténuer `text-primary` du tout.
- **Don't** utiliser de gradients flashy ou de « hero metric » (gros chiffre + petit label).
- **Don't** tomber dans le template startup: pas de grille de cartes identiques icône + titre + texte.
- **Don't** utiliser d'illustrations 3D stériles ou un ton « transformez votre workflow ».
- **Don't** éparpiller des emojis partout ou adopter un ton « hey poto »; on reste adulte et décontracté.
- **Don't** employer de side-stripe borders (bordures verticales colorées de plus de 1px) comme accent sur les listes ou cards.
- **Don't** utiliser de glassmorphism ou de gradient text à des fins décoratives.
