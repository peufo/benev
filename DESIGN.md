---
name: benevio
description: Plateforme de gestion de bénévoles pour associations, festivals et collectifs
colors:
  primary: '#0d3b66'
  secondary: '#e41e66'
  brand-beige: '#c7b198'
  brand-beige-dark: '#b8a58a'
  body: '#1f2937'
  surface: '#ffffff'
  border: '#f2f2f2'
typography:
  display:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Barlow, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 'clamp(1.875rem, 4vw, 3rem)'
    fontWeight: 800
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
  sm: '8px'
  md: '16px'
  full: '9999px'
spacing:
  page-x: '24px'
  section-y: '112px'
  card-body: '32px'
  component-gap: '16px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.sm}'
    padding: '0px 24px'
    size: '18px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.primary}'
    rounded: '{rounded.sm}'
    padding: '0px 24px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.body}'
    rounded: '{rounded.md}'
    padding: '{spacing.card-body}'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.body}'
    rounded: '{rounded.sm}'
    padding: '0px 16px'
    height: '48px'
---

# Design System: benevio

## 1. Overview

**Creative North Star: "Le carnet de bord bien tenu"**

benevio est un outil de gestion de bénévoles pensé comme un carnet de bord: clair, structuré, sans fioriture. L'interface ne cherche pas à impressionner par des effets visuels; elle gagne la confiance par l'ordre, la lisibilité et la chaleur discrète. Chaque écran doit donner l'impression que quelqu'un a déjà fait le tri et mis les bonnes informations au bon endroit.

L'atmosphère est **franche et utile**. On évite le ton corporate (« transformez votre workflow »), les illustrations 3D stériles, les grilles de cartes identiques et les gradients agressifs. On parle à des bénévoles pressés, pas à des chefs d'entreprise. La transparence open source est un atout visuel: le design doit sentir l'outil accessible et le service honnête.

**Source de vérité.** Le thème est configuré dans `tailwind.config.mjs` via **DaisyUI v3**. Les composants utilisent les classes sémantiques de DaisyUI (`btn-primary`, `card`, `input`, `navbar`, `base-100`, `base-content`...) et les tokens Tailwind (`bg-brand-beige`, `text-primary`). Les valeurs hex ci-dessous sont les valeurs canoniques du thème; elles ne doivent pas être recopiées en dur dans les composants.

**Key Characteristics:**

- Une seule police, Barlow, porte toute la hiérarchie par le poids et la taille.
- Le bleu ardoise (`primary`) est l'accent principal; il est présent mais jamais étouffant.
- Le beige sable (`brand-beige`) sert de tonalité de confort: fonds subtils, bandes de confiance, hover doux.
- Les surfaces sont planes par défaut; les ombres apparaissent seulement sur les éléments interactifs majeurs et la navigation.
- Les coins sont arrondis de manière modérée (8px pour les boutons et champs, 16px pour les cards et la navbar).

## 2. Colors

La palette est volontairement resserrée: un accent froid et stable, une nuance chaude pour l'atmosphère, et des neutres tirant légèrement vers le chaud. Tout passe par le thème DaisyUI défini dans `tailwind.config.mjs`.

### DaisyUI tokens (source de vérité dans `tailwind.config.mjs`)

- **`primary`**: `#0d3b66` — bleu ardoise profond. Couleur de marque: titres, boutons principaux, liens actifs, badges importants.
- **`secondary`**: `#e41e66` — rose vif. Réservé aux erreurs, mises en garde et éléments promotionnels.
- **`base-100`**: hérité du thème light DaisyUI — surfaces blanches (cards, navbar, champs).
- **`base-200`**: hérité du thème light — fond de hover léger (`menu-item:hover`, fonds alternés).
- **`base-300`**: hérité du thème light — fond d'état actif (`menu-item.active`).
- **`base-content`**: hérité du thème light — texte principal, légèrement atténué via `base-content/70` pour les secondaires.
- **`primary-content`**: hérité du thème light — texte sur fond `primary` (blanc par défaut).

### Tokens Tailwind personnalisés

- **`brand-beige`**: `#c7b198` — beige sable. Défini dans `theme.extend.colors` de `tailwind.config.mjs`. Utilisé comme accent chaud pour les fonds subtils (`bg-brand-beige/5`), les bandes de confiance et les hover secondaires.
- **`brand-beige-dark`**: `#b8a58a` — beige sable foncé. Variante plus soutenue du beige, utilisée pour les états hover des boutons sur fond beige (`LandingCTA`).

### Named Rules

**The DaisyUI-First Rule.** Aucune valeur hex ne doit être écrite en dur dans un composant. On utilise `primary`, `secondary`, `base-*`, `brand-beige` et leurs variantes d'opacité (`/5`, `/10`, `/20`, `/70`). Si une couleur n'existe pas dans le thème, on l'y ajoute plutôt que de l'écrire en dur.

**The One Accent Rule.** Le bleu ardoise (`primary`) est le seul accent sur la plupart des écrans. Le rose vif (`secondary`) et le beige sable (`brand-beige`) ont des rôles fonctionnels précis; ils ne deviennent pas des accents décoratifs.

## 3. Typography

**Display & Body Font:** Barlow (with system-ui, -apple-system, BlinkMacSystemFont, sans-serif)

Barlow est une sans-serif humaniste géométrique: elle a la clarté d'une interface et la chaleur d'une forme ouverte. Une seule famille porte tout le système. La hiérarchie se lit dans le contraste de poids et d'échelle, pas dans un changement de police.

### Hierarchy

- **Display** (800, clamp(2.25rem, 5vw, 3.75rem), line-height 1.1, letter-spacing -0.025em): titres de hero. Un seul par page, en haut de la page d'accueil ou d'une page brand.
- **Headline** (800, clamp(1.875rem, 4vw, 3rem), line-height 1.1): titres de section (« Comment ça marche », « Mes demandes »).
- **Title** (600, 1.25rem, line-height 1.4): titres de cards, sous-sections, sujets de messages.
- **Body** (400, 1rem, line-height 1.5): paragraphes, descriptions, contenu de formulaire. Longueur de ligne max ~75ch.
- **Label** (500, 0.875rem, line-height 1.25): libellés de champs, badges, métadonnées.

### Named Rules

**The Weight Contrast Rule.** Ne pas créer de tailles intermédiaires plates. Sauter d'au moins un poids (400 → 600 → 800) et d'au moins 1.25× en taille entre deux niveaux de hiérarchie.

## 4. Elevation

Le système est **plat par défaut, soulevé avec intention**. La profondeur n'est pas décorative: elle signale l'interactivité ou l'importance. Le fond de page porte parfois un dégradé très subtil du beige sable vers le transparent; les sections de contenu reposent sur des surfaces blanches ou des couches tonales.

### Shadow Vocabulary

- **CTA shadow** (`shadow-lg` de Tailwind): ombre par défaut des boutons primaires et de la navbar. Elle augmente au hover (`shadow-xl`) pour indiquer l'interactivité.
- **Card shadow** (`shadow-sm` de Tailwind, via la classe `card` de DaisyUI): ombre presque imperceptible sous les cards, juste assez pour les détacher du fond.

### Named Rules

**The Purposeful Lift Rule.** Une ombre ne justifie sa place que si elle guide l'œil vers une action ou délimite une surface cliquable. Pas d'ombres sur du texte statique ou des conteneurs purement informatifs. On utilise les utilitaires Tailwind (`shadow-sm`, `shadow-lg`, `shadow-xl`) plutôt que des valeurs d'ombre écrites en dur.

## 5. Components

Tous les composants s'appuient sur DaisyUI v3. Les classes utilitaires Tailwind ajustent l'espacement, la typographie et les cas particuliers. Aucune valeur de couleur ou de rayon n'est écrite en dur.

### Buttons

- **Shape:** coins arrondis modérés (`rounded-lg` = 8px), hauteur implicite gérée par DaisyUI.
- **Primary:** `btn btn-primary btn-lg` — fond `primary`, texte `primary-content`, ombre `shadow-lg` au repos, `shadow-xl` au hover.
- **Ghost:** `btn btn-ghost btn-lg text-primary` — fond transparent, texte `primary`, hover `hover:bg-primary/5`.
- **Icon leading:** les icônes utilisent Lucide (taille 18–22px), alignées avec le texte via `gap-2`.

### Cards / Containers

- **Class DaisyUI:** `card bordered border bg-base-100 shadow-lg`.
- **Corner Style:** `rounded-2xl` (16px) sur le corps interne, hérité du composant `Card` de `fuma`.
- **Background:** `base-100` (blanc).
- **Border:** `base-200` via `border`.
- **Shadow Strategy:** `shadow-lg` sur le conteneur externe; le composant `Card` de `fuma` gère cela.
- **Internal Padding:** `card-body` avec `p-2 sm:p-8` (8px mobile, 32px desktop).

### Inputs / Fields

- **Class DaisyUI:** `input input-bordered` et `textarea textarea-bordered`.
- **Style:** fond `base-100`, bordure héritée de DaisyUI, coins `rounded-lg` (8px).
- **Focus:** traitement fourni par DaisyUI (bordure `primary`).
- **Label:** `label-text` de DaisyUI (0.875rem, poids 500).
- **Error:** `label-text-alt text-warning` (DaisyUI).

### Navigation

- **Header:** `navbar rounded-b-2xl bg-base-100 shadow-lg` — blanc, coins arrondis en bas (16px), ombre fonctionnelle.
- **Links:** `link link-hover` de DaisyUI, opacité réduite via `opacity-70`. Pas de soulignement permanent.
- **Menu items:** `menu-item` (classe custom dans `app.css`) avec icône Lucide 20px à gauche, fond `base-200` au hover, fond `base-300/80` quand actif.
- **Mobile:** menu hamburger (`Menu` Lucide) déclenchant un dropdown.

### Signature Component: Trust Band

Bande horizontale avec fond `bg-brand-beige/5` et bordures `border-brand-beige/20`. Elle porte les preuves de confiance (open source, solide, simple) sous forme de petites pastilles colorées. C'est le moment où le design dit « tu peux y aller » sans être tape-à-l'œil.

## 6. Do's and Don'ts

### Do:

- **Do** définir les couleurs dans `tailwind.config.mjs` via le thème DaisyUI ou `theme.extend.colors`.
- **Do** utiliser `primary`, `secondary`, `base-*`, `brand-beige` et leurs variantes d'opacité dans le code.
- **Do** utiliser Barlow pour tout le texte, de l'UI au marketing.
- **Do** laisser beaucoup d'air autour des sections (`py-20 md:py-28`) pour respecter le rythme de lecture.
- **Do** préférer des icônes Lucide fines et simples aux icônes MDI chargées.
- **Do** garder les cards blanches avec une bordure `base-200` plutôt que des ombres lourdes.
- **Do** utiliser `brand-beige` comme fond subtil ou couleur de hover, jamais comme texte principal.

### Don't:

- **Don't** écrire de valeurs hex en dur dans les composants (ex: `bg-[#0d3b66]`).
- **Don't** écrire de valeurs de rayon, d'ombre ou d'espacement en dur si un token Tailwind ou DaisyUI existe.
- **Don't** utiliser de gradients flashy ou de « hero metric » (gros chiffre + petit label), comme le rejette PRODUCT.md.
- **Don't** tomber dans le template startup: pas de grille de cartes identiques icône + titre + texte.
- **Don't** utiliser d'illustrations 3D stériles ou un ton « transformez votre workflow ».
- **Don't** éparpiller des emojis partout ou adopter un ton « hey poto »; on reste adulte et décontracté.
- **Don't** employer de side-stripe borders (bordures verticales colorées de plus de 1px) comme accent sur les listes ou cards.
- **Don't** utiliser de glassmorphism ou de gradient text à des fins décoratives.
- **Don't** laisser `secondary` devenir un accent principal; il est réservé aux erreurs et aux mises en garde.
