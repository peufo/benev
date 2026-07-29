# Product

<!-- impeccable:product-schema 1 -->

Benevio est une plateforme open source de gestion de bénévoles: un organisateur crée son événement, découpe son programme en équipes et en créneaux, et les bénévoles s'inscrivent eux-mêmes. Le produit tient en deux moitiés qui se répondent — les pages publiques qui convainquent, et l'application qui tient le carnet de bord.

## Platform

web

## Users

**Les organisateurs** — associations, festivals, collectifs sportifs, manifestations locales. Ils cherchent une solution simple pour gérer leurs bénévoles, sont souvent bénévoles eux-mêmes, pressés par le temps, et méfiants envers les outils complexes ou payants. Ils découvrent Benevio via bouche-à-oreille, recherche web, ou réseaux sociaux. Ce sont eux qui décident, paient, et paramètrent.

**Les responsables (leaders)** — bénévoles à qui l'organisateur délègue une équipe. Ils valident des inscriptions et suivent leurs propres créneaux, sans accéder au paramétrage de l'événement.

**Les bénévoles** — invités par un organisateur ou arrivés par un lien partagé. Ils ne choisissent pas l'outil, ils le reçoivent: ils veulent s'inscrire à un créneau et savoir où et quand se présenter, sans créer de compte de trop ni remplir de formulaire de trop. Beaucoup arrivent sur mobile, une seule fois, sans intention de revenir souvent. Ils sont le volume; les organisateurs sont le choix.

Un même écran sert souvent plusieurs de ces publics: la connexion, l'inscription à un événement et le profil sont traversés par tous, et doivent rester lisibles pour quelqu'un qui n'a jamais vu le produit.

**Les deux publics ne sont pas en tension.** La plateforme est conçue pour avantager l'organisateur _et_ le bénévole en même temps. Une décision qui améliore l'un au détriment de l'autre n'est pas un arbitrage à trancher: c'est le signe que la conception est mauvaise et qu'il faut chercher la solution qui sert les deux.

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

## Positioning

**Le code est libre, l'hébergement est un service.**

Benevio est publié sous licence **AGPL-3.0** sur `github.com/peufo/benev`. N'importe qui peut l'utiliser, le modifier, le redistribuer et l'héberger lui-même. Ce qui est payant sur benev.io, c'est l'hébergement clé en main: les serveurs et le support ont un coût réel, le logiciel non.

C'est la position qu'un concurrent ne peut pas copier honnêtement. Un SaaS fermé peut imiter les fonctionnalités et le prix; il ne peut pas offrir l'absence de vendor lock-in ni la vérifiabilité du code. Cela a deux conséquences durables:

- **Le prix se justifie par le service, jamais par l'accès au logiciel.** Aucune fonctionnalité ne doit être verrouillée pour forcer l'abonnement; les paliers portent sur le volume de bénévoles, pas sur des fonctions.
- **L'auto-hébergement est un droit réel, pas un argument marketing.** Le produit ne doit pas dépendre d'un service propriétaire sans issue de secours documentée.

## Operating Context

Benevio est utilisé sur les quatre temps d'un événement. Aucun n'est secondaire.

1. **La préparation, au calme.** L'organisateur construit équipes, créneaux et planning depuis un ordinateur, sur plusieurs semaines. C'est là que vivent les interfaces denses: la grille de planning glisser-déposer (`$lib/plan`), la liste des membres, les quotas, les champs personnalisés, les pages CMS de l'événement.
2. **L'inscription du bénévole.** Il reçoit un lien, s'inscrit à des créneaux depuis son téléphone, souvent une seule fois, sans jamais revenir. La friction se paie ici plus cher que partout ailleurs.
3. **Le jour J, sur le terrain.** Téléphone en main, dehors, parfois en plein soleil: pointer les arrivées, retrouver qui manque. Le produit porte pour cela un QR par membre (`/qr/[memberId]`), des badges PDF imprimables et un export iCal des créneaux.
4. **Le bilan.** Compter, attribuer les dédommagements (`Gift`), exporter les listes, remercier.

La lisibilité en extérieur et sur petit écran n'est donc pas une précaution théorique: c'est le troisième temps.

## Capabilities and Constraints

**Ce que le produit fait**

- Événements avec états (brouillon, ouvert, archivé), pages CMS propres à chaque événement, thème et médias personnalisés.
- Équipes, périodes (créneaux) et inscriptions, avec validation par les responsables et conditions d'accès paramétrables.
- Membres avec champs personnalisés par événement, invitations par email, charte à accepter, profils enrichis (rôles, statistiques, dons).
- Planning glisser-déposer, jalons, vues sauvegardées, tags.
- Badges PDF avec QR, export iCal, exports de listes.
- Emails transactionnels: vérification, réinitialisation, demandes d'inscription (envoyée / acceptée / refusée / annulée), validation de paiement.

**Vocabulaire du domaine** — à employer tel quel dans l'interface et le code: _événement_, _équipe_, _période_ (ou _créneau_), _membre_, _bénévole_, _responsable_, _adhésion_, _inscription_, _charte_, _jalon_, _don_, _badge_.

**Paliers et quotas** — le quota porte sur le nombre de **membres validés**, jamais sur les fonctionnalités:

| Palier   | Prix       | Membres validés |
| -------- | ---------- | --------------- |
| Basique  | 0 CHF      | 50              |
| Standard | 99 CHF     | 200             |
| Premium  | 249 CHF    | illimité        |
| Pro      | sur mesure | illimité        |

Paiements par Stripe. Prix en CHF; le produit est ancré en Suisse (Dev Voisard, Switzerland).

**Contraintes durables**

- **Une seule langue: le français.** Aucune infrastructure d'i18n n'existe et aucune n'est prévue; `<html lang="fr">`. Ne pas introduire de chaînes anglaises visibles par l'utilisateur.
- **Tutoiement.** L'interface tutoie l'utilisateur, partout.
- Comptes créés par invitation: un membre inscrit par un organisateur existe sans mot de passe et réclame son compte par le lien de réinitialisation. Tout parcours d'authentification doit tenir ce cas.
- Les flux d'authentification ne doivent pas permettre d'énumérer les comptes.
- Les médias sont stockés sur le système de fichiers local (`MEDIA_DIR`), pas sur un service objet.
- La bibliothèque de composants `fuma` est développée en parallèle dans un dépôt voisin, lié localement.

## Brand Commitments

**Nom.** « benevio » en minuscules dans toute la copie destinée à l'utilisateur. Les références techniques (URL, dépôt, image Docker) peuvent rester « benev ». Domaine: benev.io.

**Personnalité: sympa, simple, open source.**

- **Sympa**: accueillant, humain, pas intimidant. On parle à des bénévoles, pas à des chefs d'entreprise.
- **Simple**: chaque mot, chaque visuel doit respirer la clarté. Pas de jargon. Pas de fonctionnalités qui écrasent.
- **Open source**: transparent, communautaire, pas de vendor lock-in. C'est un avantage concurrentiel, pas une note de bas de page.

**Contrainte visuelle contraignante.** Le produit n'a **qu'une seule source de couleur**: le thème DaisyUI déclaré dans `src/app.css`. Aucune palette de marque en parallèle, aucun fichier de configuration de thème, aucune couleur en dur dans un composant. Toute couleur nouvelle s'ajoute au thème, ou n'existe pas. Les rôles de chaque token et leurs contrastes mesurés vivent dans `DESIGN.md`.

**Actifs existants.** Logo (`src/lib/assets/logo.svg`, plus une version animée), licence AGPL-3.0, dépôt public.

## Anti-references

- **SaaS corporate générique**: pas de gradients flashy, pas de « transformez votre workflow », pas d'illustrations 3D stériles.
- **Trop enfantin / playful**: pas d'émojis partout, pas de couleurs criardes, pas de ton « hey poto ». On reste adulte et professionnel, mais décontracté.
- **Template startup**: pas de « hero metric » (gros chiffre + petit label), pas de grille de cartes identiques icône + titre + texte.
- **Complexité featuriale**: pas de liste interminable de fonctionnalités. On montre l'essentiel, on laisse découvrir le reste dans l'app.

## Evidence on Hand

**Témoignages réels**, avec nom, rôle, événement, lien et photo — `src/lib/testimonials/testimonials.ts`:

- **Nicole**, responsable, _Dritchino open air Festival_ (dritchino.ch), > 500 bénévoles.
- **Valérie**, responsable, _Spiegelberg_ (spiegelbergfestival.com), > 200 bénévoles.

Ce sont de vraies personnes et de vrais événements. Leurs citations ne doivent pas être réécrites, résumées ni complétées.

**Preuves d'ouverture, vérifiables en direct** — la page `/open-source` affiche les issues GitHub ouvertes et fermées du dépôt, en temps réel (`$lib/GithubIssues.svelte`). La licence et le dépôt sont publics.

**Prix réels** — les montants du tableau ci-dessus sont ceux de `$lib/constant`, liés à de vrais identifiants de prix Stripe.

**Ce qui n'existe pas et ne doit pas être inventé:**

- Aucune métrique agrégée de la plateforme (nombre total d'événements, de bénévoles, d'heures gérées). Il n'y en a nulle part dans le dépôt. Ne pas en fabriquer — ce qui rejoint l'interdiction du « hero metric ».
- Aucun logo client, label, prix, certification ou mention presse.
- Aucun benchmark ni comparatif chiffré face à un concurrent.
- Aucune documentation d'auto-hébergement publiée à ce jour: l'auto-hébergement est un droit réel (le code est là), mais il ne faut pas promettre un guide qui n'existe pas encore.

## Product Principles

1. **La simplicité est la fonctionnalité.** Si on peut enlever un élément sans perdre de sens, on l'enlève.
2. **La confiance naît de la transparence.** L'open source et le prix sont visibles dès le premier écran, pas cachés dans un pied de page.
3. **Parler humain.** Pas de jargon tech ou marketing. Les mots doivent être ceux qu'un organisateur utiliserait avec ses amis — et les messages d'erreur sont en français, comme le reste.
4. **Montrer, pas dire.** Plutôt qu'une liste de fonctionnalités, des témoignages et des preuves vérifiables.
5. **Servir les deux publics à la fois.** Une amélioration pour l'organisateur qui coûte au bénévole n'est pas terminée. Le bas-friction du bénévole et le contrôle de l'organisateur doivent tenir ensemble.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum
- Support du mouvement réduit (aucune animation indispensable à la compréhension)
- Contraste suffisant pour la lecture en extérieur: le troisième temps d'usage se passe dehors, sur téléphone, entre deux tâches
- Tout parcours d'inscription doit être franchissable au clavier seul, y compris les bascules entre modes d'un même formulaire
