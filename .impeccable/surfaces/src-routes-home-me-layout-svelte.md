---
version: 1
slug: 'src-routes-home-me-layout-svelte'
primary_target: 'src/routes/(home)/me/+layout.svelte'
related_targets:
  [
    'src/routes/(home)/me/events/+page.svelte',
    'src/routes/(home)/me/events/past/+page.svelte',
    'src/routes/(home)/me/account/+page.svelte',
    'src/routes/(home)/me/checkouts/+page.svelte',
    'src/lib/me/LayoutMe.svelte',
  ]
---

# Surface: /me — espace personnel

**Portée**: `/me/events`, `/me/events/past`, `/me/account`, `/me/checkouts` et leur
enveloppe (`LayoutMe`).
**Mode visiteur**: Operate — on vient accomplir une tâche, pas se laisser convaincre.

## Public et tâche

Le public prioritaire est **le bénévole**, arbitré comme tel avec le porteur du produit:
il arrive par un lien, consulte souvent depuis un téléphone, parfois le jour J en
extérieur. Sa question est « où et quand suis-je attendu ».

**On a généralement peu d'évènements en cours.** C'est la donnée de cadrage: un compte
d'essai à vingt évènements n'est pas le cas courant, et avait initialement fait choisir
une densité que le produit ne demande pas. Les évènements courants ont donc droit à de
la place; ce sont les évènements terminés qui s'accumulent, et eux seuls.

## Direction retenue

Une entrée généreuse par évènement courant, séparée par des filets — pas une grille de
cartes, pas une liste dense.

- **Vignette d'identité** (`EventPoster`, 80×112): l'affiche de l'évènement quand elle
  existe, son icône sinon, et à défaut un **monogramme** tiré du nom (`eventInitials`)
  sur fond sable. Une tuile vide dirait « actif manquant »; un monogramme identifie.
- **Le prochain créneau prime**: le créneau accepté le plus proche (jour, heures,
  secteur) est détaché dans un encart `bg-secondary/10`, en `primary`. C'est la réponse
  littérale à « où et quand », et elle passe avant les compteurs.
- **Trois groupes visibles**: invitations en attente, « À venir », « Sans date ».
  « À venir » épingle les évènements en cours, puis trie sur la date de fin.
- **Les terminés sortent de la page**, derrière un bouton qui les compte
  (« 14 évènements terminés ») menant à `/me/events/past`. Là, et là seulement, le
  registre compact a du sens: groupé par année, une ligne par évènement.
- `/me/checkouts` garde ce registre compact, bord gauche daté.

Ce qui n'a pas sa place ici: le palier de facturation de l'évènement (métadonnée
d'organisateur), et plus d'une action primaire par écran.

## Contraintes

- Les URLs et les fonctions sont préservées. `/me/events/past` est une addition.
- `getEventMembers` / `partitionEventMembers` (`$lib/me/events.server.ts`) sont partagés
  par les deux pages: les règles de tri et de groupe ne doivent exister qu'une fois,
  sans quoi un évènement pourrait manquer aux deux.
- Toute mutation passe par une remote function; `enhanceForm` (`$lib/enhanceForm.ts`)
  porte le traitement commun — `submit()` renvoyant `false` n'est pas un succès, et une
  erreur levée est un `HttpError` qu'il faut lire via `isHttpError(err).body.message`.
- Le callback de `enhance` ne reçoit ni `data` ni `form`: leurs accesseurs lèvent.
  Utiliser `instance.element` et `instance.fields`.
- Le titre de page est en `sr-only` sur `/me/events`: l'onglet actif le nomme déjà à
  l'écran, mais le document a besoin d'un `h1`.

## Décisions non tranchées

- `/me/checkouts` n'expose aucun reçu ni facture: le modèle `Checkout` ne stocke pas
  d'URL de reçu Stripe. Le faire demande une migration de schéma ou un appel Stripe au
  chargement. C'est le premier des trois besoins exprimés pour cette page, et il reste
  ouvert.
- L'emplacement du bouton « Organiser un nouvel événement » n'est pas arrêté (TODO en
  place dans `+page.svelte`).
- Aucune vue de recherche ou de filtre pour les comptes à fort volume: le bouton des
  terminés suffit tant que les évènements courants restent peu nombreux.
