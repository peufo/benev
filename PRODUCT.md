# Product

Benevio est une plateforme open source de gestion de bénévoles: un organisateur crée son événement, découpe son programme en équipes et en créneaux, et les bénévoles s'inscrivent eux-mêmes. Le produit tient en deux moitiés qui se répondent — les pages publiques qui convainquent, et l'application qui tient le carnet de bord.

## Users

**Les organisateurs** — associations, festivals, collectifs sportifs, manifestations locales. Ils cherchent une solution simple pour gérer leurs bénévoles, sont souvent bénévoles eux-mêmes, pressés par le temps, et méfiants envers les outils complexes ou payants. Ils découvrent Benevio via bouche-à-oreille, recherche web, ou réseaux sociaux. Ce sont eux qui décident, paient, et paramètrent.

**Les bénévoles** — invités par un organisateur ou arrivés par un lien partagé. Ils ne choisissent pas l'outil, ils le subissent: ils veulent s'inscrire à un créneau et savoir où et quand se présenter, sans créer de compte de trop ni remplir de formulaire de trop. Beaucoup arrivent sur mobile, une seule fois, sans intention de revenir souvent. Ils sont le volume; les organisateurs sont le choix.

Un même écran sert souvent les deux: la connexion, l'inscription à un événement et le profil sont traversés par les deux publics, et doivent rester lisibles pour quelqu'un qui n'a jamais vu le produit.

## Product Purpose

**Sur les pages publiques** — convaincre l'organisateur en 30 secondes que Benevio est l'outil qu'il lui faut:

- Démontrer la simplicité du produit sans le montrer en action (pas de démo vidéo)
- Créer la confiance par la transparence (open source, prix clair)
- Inciter à l'essai immédiat avec un CTA clair et bas-friction
- Rassurer sur le coût et l'engagement (gratuit pour les petits événements)

**Dans l'application** — faire disparaître l'outil derrière la tâche:

- Amener un bénévole de « on m'a envoyé un lien » à « je suis inscrit » sans qu'il ait à comprendre le produit
- Donner à l'organisateur une vue immédiate de qui manque, où et quand
- Ne jamais demander deux fois la même information, ni plus que ce que l'événement exige réellement
- Ne jamais laisser un échec sans issue: chaque erreur nomme le problème et la sortie

## Brand Personality

Sympa, simple, open source

- **Sympa** : accueillant, humain, pas intimidant. On parle à des bénévoles, pas à des chefs d'entreprise. On tutoie.
- **Simple** : chaque mot, chaque visuel doit respirer la clarté. Pas de jargon. Pas de fonctionnalités qui écrasent.
- **Open source** : transparent, communautaire, pas de vendor lock-in. C'est un avantage concurrentiel, pas une footnote.

## Anti-references

- **SaaS corporate générique** : pas de gradients flashy, pas de "transformez votre workflow", pas d'illustrations 3D stériles.
- **Trop enfantin / playful** : pas d'émojis partout, pas de couleurs criardes, pas de ton "hey poto". On reste adulte et professionnel, mais décontracté.
- **Template startup** : pas de "hero metric" (gros chiffre + petit label), pas de grille de cartes identiques icône+titre+texte.
- **Complexité featuriale** : pas de liste interminable de fonctionnalités. On montre l'essentiel, on laisse découvrir le reste dans l'app.

## Design Principles

1. **La simplicité est la fonctionnalité** : si on peut enlever un élément sans perdre de sens, on l'enlève.
2. **La confiance naît de la transparence** : l'open source et le prix sont visibles dès le premier écran, pas cachés dans un footer.
3. **Parler humain** : pas de jargon tech ou marketing. Les mots doivent être ceux qu'un organisateur utiliserait avec ses amis — et les messages d'erreur sont en français, comme le reste.
4. **Montrer, pas dire** : plutôt qu'une liste de features, des témoignages et des preuves sociales.
5. **Bas-friction avant tout** : le CTA doit être immédiat et sans engagement apparent, et un bénévole ne doit jamais avoir à ressaisir ce qu'il vient de taper.

## Visual Constraints

Le produit n'a **qu'une seule source de couleur**: le thème DaisyUI déclaré dans `src/app.css`, via le bloc `@plugin 'daisyui/theme'` de Tailwind CSS v4 + DaisyUI v5. Il n'existe aucune palette de marque en parallèle, aucun fichier de configuration de thème, aucune couleur en dur dans un composant. Toute couleur nouvelle s'ajoute au thème, ou n'existe pas.

Cette contrainte est un choix produit autant que technique: elle garantit que le jour où un événement veut son propre habillage, un seul bloc CSS change et tout le produit suit. Les rôles de chaque token, leurs contrastes mesurés et les règles d'usage vivent dans `DESIGN.md`.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum
- Support réduit mouvement (pas d'animations indispensables)
- Contraste suffisant pour la lecture en extérieur (beaucoup d'organisateurs et de bénévoles consultent sur mobile entre deux tâches)
- Tout parcours d'inscription doit être franchissable au clavier seul, y compris les bascules entre modes d'un même formulaire
