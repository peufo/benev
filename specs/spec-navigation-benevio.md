# Spec — Refonte de la navigation (issue #169)

**Projet :** benev / Benevio — SvelteKit + Tailwind + Prisma
**Statut :** spec de conception, prête à implémenter
**Portée :** architecture de l'information, chrome de navigation, recherche, pages de détail. Pas de refonte visuelle des pages elles-mêmes.

## Comment lire cette spec

Chaque décision est accompagnée de sa raison. Les raisons sont là pour arbitrer les cas non prévus, pas pour être rediscutées : la section « Décisions écartées » liste les alternatives déjà évaluées et rejetées, avec leur motif. Si un cas d'implémentation n'est couvert nulle part, appliquer les principes de la section 2 et signaler l'arbitrage.

---

## 1. Problème à résoudre

La navigation actuelle mélange dans une seule barre quatre choses de natures différentes : le site produit (landing, tarifs, open source, CGU), le compte utilisateur (mes événements, mes infos, mes achats), l'événement côté public (pages, secteurs) et l'administration de l'événement.

Ces quatre choses ne sont pas parallèles, elles sont hiérarchiques : le compte contient des événements, un événement contient une partie publique et une partie administration. Une barre à plat ne peut pas exprimer cette hiérarchie. Symptômes actuels : les secteurs apparaissent à deux endroits distincts, cinq entrées du menu d'administration sont en réalité des réglages, et l'accueil d'un événement ne sait pas à quel rôle il s'adresse.

## 2. Principes directeurs

1. **Un seul contexte actif à la fois.** On ne superpose jamais deux niveaux de navigation.
2. **L'anatomie du chrome ne change jamais.** L'ordre est toujours : identité → recherche → navigation → moi. Seul le contenu change.
3. **Une seule URL par objet.** Les affordances d'édition apparaissent selon le rôle ; on ne duplique jamais une ressource en version « publique » et version « admin ».
4. **La navigation entre sections vit dans le chrome. La navigation à l'intérieur d'une section vit dans la page.**
5. **Maximum cinq emplacements dans la barre d'identité** (identité, recherche, état, aide, avatar). Tout candidat supplémentaire descend d'un niveau ou entre dans la page.

---

## 3. Modèle de contextes

Il existe **deux espaces** et **une zone de compte**.

| | Contenu | Accès |
|---|---|---|
| Espace **Benevio** | Landing, tarifs, open source, CGU, documentation, annuaire des événements, « mes événements » | Sélecteur de contexte |
| Espace **Événement** | Tableau de bord, secteurs, pages d'info, mes créneaux, + mode administration | Sélecteur de contexte |
| Zone **compte** | Profil, achats, préférences, déconnexion | Menu avatar uniquement |

**Règle de partage :** le sélecteur répond à « quelles données je regarde », l'avatar répond à « qui je suis ». La zone de compte n'apparaît jamais dans le sélecteur. Les pages de compte appartiennent à l'espace Benevio (le sélecteur y affiche « Benevio »).

L'**administration n'est pas un troisième espace**, c'est un **mode** de l'espace Événement. On y bascule par un contrôle explicite, et la bascule est signalée visuellement en permanence.

---

## 4. Sélecteur de contexte

### Contenu du menu

```
Mes événements
  ▸ Paléo 2026            (avec logo/initiales)
  ▸ Festival de la Cité
  ▸ Fête du village
  + Créer un événement
─────────────────────
Espace général
  ▸ Benevio
```

Les événements en premier (fréquence d'usage réelle), Benevio en dessous comme porte de sortie. **Conserver l'intitulé de section ou un séparateur**, sinon « Benevio » se lit comme un événement de plus.

### Déclencheur

Le déclencheur du sélecteur **est aussi le logo**. Il n'y a jamais deux logos affichés simultanément : la marque Benevio dans l'espace général, le logo de l'événement dans un événement.

- Gabarit fixe : hauteur 28px, largeur max 120px, `object-fit: contain`.
- Le logo téléversé est toujours posé sur une **pastille blanche arrondie** (padding 4px, radius 6px) — beaucoup de logos sont sombres sur fond transparent et disparaîtraient en thème sombre. Évite d'exiger deux versions de l'organisateur.
- **Repli sans logo :** carré coloré avec les deux initiales dérivées du nom de l'événement. La majorité des petits événements n'auront pas de fichier ; le header ne doit jamais être nu.
- Le même logo (ou repli) est réutilisé dans les lignes du sélecteur, les cartes de « mes événements » et les mails d'invitation. C'est la cohérence sur tous les points de contact qui crée le sentiment d'appropriation.

### Comportements

- **Un seul espace disponible** → le déclencheur devient un simple libellé : pas de chevron, pas de menu. La majorité des bénévoles ne verront jamais de menu déroulant.
- **Visiteur anonyme sur une page d'événement** → nom et logo de l'événement, non cliquables, et bouton « Se connecter » à la place de l'avatar. Le visiteur n'a pas besoin de savoir que Benevio existe.
- **Mobile** → ouvre une bottom sheet, pas un menu déroulant.
- **Le logo Benevio** ramène toujours à l'accueil de l'espace Benevio, quel que soit le contexte. Un seul comportement, jamais contextuel.

### Bascule de contexte

**Structure du menu**, de haut en bas : champ de filtre (au-delà de 8 événements actifs, avec focus automatique à l'ouverture et navigation clavier), invitations en attente, événements en cours avec le rôle de l'utilisateur, événements passés repliés derrière un compteur, création d'événement, espace Benevio.

- Les **invitations en attente** figurent dans le menu, badgées. C'est le seul cas où quelqu'un doit entrer dans un espace auquel il n'appartient pas encore ; sans cela le mail d'invitation reste le seul chemin.
- Les **événements passés sont repliés** par défaut. Ils s'accumulent : un bénévole régulier en aura une quinzaine au bout de quelques années, pour deux ou trois actifs.
- Pas d'entrée « voir tous mes événements » : l'espace Benevio *est* cette page une fois connecté.

**Page d'arrivée après bascule :** conserver la section courante si elle existe dans l'événement cible et que le rôle y donne droit, sinon retomber sur l'accueil de l'événement. Ne **jamais** transposer l'URL complète — `/[a]/membres/42` → `/[b]/membres/42` n'a aucun sens.

**Le mode se recalcule à l'arrivée, il ne se transporte pas.** Un utilisateur organisateur sur l'événement A et simple bénévole sur B atterrit sur B en vue bénévole avec la top bar, même s'il quittait A depuis une sidebar d'administration.

**Autres chemins de bascule :** les événements restent indexés dans la famille « Aller à » de la recherche dans tous les contextes. C'est la seconde exception à la règle de portée (avec la documentation), pour la même raison : changer de contexte relève de la navigation, pas de la donnée.

### Identité Benevio sur les pages d'événement

Elle sort du chrome et se place en pied de page (« Propulsé par Benevio », lien vers la landing) ainsi que sur l'entrée « Benevio » du sélecteur ouvert. C'est un meilleur canal d'acquisition que le header : un bénévole satisfait qui organise ensuite sa propre fête ira y regarder.

---

## 5. Dispositions (shells)

### 5.1 Espace Benevio et espace Événement, vue bénévole — **top bar**

Deux lignes :

**Ligne 1 (identité)** — invariante en anatomie :
`[logo + nom + chevron]  [recherche]  [état de publication]  [aide]  [avatar]`

**Ligne 2 (navigation de contexte)** — dépend du contexte et du rôle :

| Contexte | Entrées |
|---|---|
| Benevio, anonyme | Accueil · Fonctionnalités · Tarifs · Documentation |
| Benevio, connecté | Mes événements · Découvrir · Documentation |
| Compte | Mon profil · Mes achats · Préférences |
| Événement, bénévole | Tableau de bord · Secteurs · Mes créneaux · *pages d'info* |
| Événement, administration | Membres · Inscriptions · Planification · Pages · Paramètres |

En mode administration, la ligne 2 porte à droite l'entrée « Vue bénévole ». En vue bénévole, elle porte à droite l'entrée « Administration », visible seulement si le rôle le permet. **Pas de fond teinté sur le mode administration** : c'est l'état par défaut d'un organisateur, et on signale l'exception, pas la norme (voir 5.5).

### 5.2 Espace Événement, mode administration — **sidebar** (196px)

De haut en bas : sélecteur de contexte, champ de recherche, entrées de navigation avec compteurs, séparateur, bascule « Vue bénévole ». En bas : état de publication, puis ligne utilisateur (avatar + nom + menu).

Le changement de disposition au moment de la bascule est **voulu** : il signale l'entrée dans les coulisses plus fortement qu'une teinte de fond. Le sélecteur reste dans le même coin de l'écran, donc la rupture reste lisible.

- La sidebar est **repliable en rail d'icônes**, état persistant par utilisateur.
- Elle est **repliée par défaut sur la route Planification**, dont la grille temporelle est vorace en largeur.
- La partie bénévole conserve la top bar : une page publique d'événement doit ressembler au site de l'événement, pas à un outil de gestion.

### 5.3 Mobile (< 768px)

- **Header compact** : logo + nom tronqué + chevron à gauche ; icône recherche + avatar à droite. Pas de recherche en champ ouvert.
- **Barre du bas**, exactement 4 créneaux, jamais 5 :
  - Vue bénévole : Accueil · Secteurs · Mes créneaux · Infos
  - Mode administration : Membres · Inscriptions · Planification · Paramètres
- La bascule de mode descend dans la feuille de l'avatar.
- **Pas de sidebar, pas de menu hamburger côté bénévole.** La barre du bas *est* la ligne 2 : mêmes entrées, même ordre, même état actif.
- L'espace Benevio n'a **pas** de barre du bas — on y passe une fois, un menu depuis le header suffit. La barre du bas est réservée aux endroits où l'utilisateur travaille de façon répétée.
- La recherche s'ouvre en plein écran.

### 5.4 Navigation comme données

Implémenter la navigation sous forme de configuration, pas de balisage dupliqué dans chaque shell :

```ts
type NavEntry = {
  id: string
  label: string
  icon: string
  href: string
  kind: 'structural' | 'editorial'
  badge?: () => number | undefined
}

getNavigation(context, role, event): NavEntry[]
```

Les trois shells (top bar, sidebar, barre du bas) consomment la même source et se contentent de la rendre horizontalement, verticalement ou en 4 créneaux. Le choix top bar / sidebar devient une décision de rendu, réversible sans toucher à l'architecture.

---

### 5.5 Pages partagées entre les deux modes

Certaines pages servent les deux audiences sur la même URL — `/teams` au premier chef, ainsi que le tableau de bord et les pages d'info.

**Une même entrée peut figurer dans les deux navigations, à condition de pointer vers la même URL.** Ce qui est interdit, c'est deux *pages* pour le même objet, pas deux points d'entrée vers une page unique. « Secteurs » apparaît donc à la fois dans la top bar en vue bénévole et dans la sidebar d'administration, avec le même `href`.

Le mode est un **paramètre de rendu, pas une route**. Sur une page partagée, il contrôle exactement trois choses :

- la visibilité des brouillons et des éléments non publiés ;
- l'affichage des données de gestion (taux de remplissage, inscriptions en attente) ;
- la présence des contrôles d'édition et de création.

Il ne change ni l'URL de la ressource, ni les données auxquelles l'utilisateur a droit — les permissions restent vérifiées côté serveur indépendamment du mode.

**Détermination du mode :**

- sur une route du groupe `(admin)` → administration, implicite ;
- sur une page partagée → paramètre d'URL `?view=volunteer`, défaut `admin` pour les rôles qui en ont le droit ;
- pour un utilisateur sans droits d'administration → toujours la vue bénévole, le paramètre est ignoré.

Exprimer le mode dans l'URL le rend partageable et reproductible : un organisateur peut envoyer à un collègue exactement ce qu'il voit, et le support peut demander un lien plutôt qu'une capture.

**Bénéfice attendu :** la bascule cesse d'être un artifice de navigation pour devenir un **aperçu**. « Qu'est-ce que mes bénévoles voient réellement ? » est une question que les organisateurs se posent en permanence et à laquelle le produit ne sait pas répondre aujourd'hui.

### 5.6 Contrôles de bascule de mode

**La bascule est asymétrique.** Les deux sens ne reçoivent pas le même traitement, parce qu'ils n'ont pas la même nature.

**Vue bénévole → administration : une destination.** Entrée permanente et discrète en bout de ligne 2 (ou de sidebar), visible uniquement pour les rôles qui y ont droit. Se comporte comme n'importe quel lien de navigation.

**Administration → vue bénévole : un état d'aperçu.** Ce n'est pas une destination mais une lentille temporaire. Sans signalement, un organisateur constate la disparition de ses boutons d'édition sans explication.

L'aperçu est donc annoncé par un **bandeau persistant** en haut de page :

```
👁  Aperçu — vous voyez cette page comme  [Bénévole ▾]  [× Quitter l'aperçu]
```

- **Sélecteur de rôle simulé** : bénévole, responsable, visiteur non connecté. Le dernier est le plus utile — prévisualiser ce que voit un inconnu avant publication est aujourd'hui impossible sans navigation privée.
- **Quitter l'aperçu ramène à la même URL** en mode administration, jamais au tableau de bord.
- Le bandeau **est le seul signalement**. Ne pas y ajouter de teinte de fond sur le mode administration : on signale l'état inhabituel, pas l'état normal, et la sidebar distingue déjà l'administration structurellement.
- **Mobile** : le bandeau passe à l'identique, c'est l'élément à préserver en priorité. L'entrée « Administration » descend dans la feuille de l'avatar, la barre du bas n'ayant pas de cinquième créneau.
- Complément clavier : entrée « Aperçu bénévole » dans la famille « Actions » de la recherche.

**L'aperçu n'est pas un mécanisme de sécurité.** Il ne modifie que le rendu ; les permissions restent vérifiées côté serveur.

### 5.7 Degré de réalisme de l'aperçu

**Règle :** fidèle en lecture, simulé en écriture, jamais silencieux sur la différence.

Griser les formulaires rendrait l'aperçu inutile — le formulaire d'adhésion est précisément ce qu'un organisateur veut vérifier avant d'ouvrir les inscriptions. Écrire réellement lui créerait des inscriptions fantômes et fausserait ses compteurs. L'écriture doit donc être **complète mais non persistée**.

| Élément | Comportement en aperçu |
|---|---|
| Contenu, visibilité, brouillons | Fidèle, filtré côté serveur |
| Formulaire d'adhésion | S'affiche, valide, affiche ses erreurs, soumission simulée |
| Bouton « S'inscrire » | Actif, vérifie réellement la capacité, écran de confirmation affiché |
| Compteurs de places | Réels, jamais décrémentés |
| Mails et notifications | Supprimés |
| Paiement | Jamais déclenché — arrêt explicite avant la redirection vers le prestataire |

**Implémentation :** exécuter la mutation dans une **transaction systématiquement annulée**. Toute la validation serveur réelle est obtenue gratuitement — contraintes d'unicité, secteur complet, période chevauchante, adhésion déjà existante — avec les vrais messages d'erreur.

Deux effets échappent au rollback et doivent être coupés explicitement par un drapeau `preview` porté dans le contexte de requête : **l'envoi de mails** et **les appels au prestataire de paiement**. Un rollback ne désenvoie pas un mail.

Le bandeau annonce la conséquence, pas seulement l'état : « Aucune donnée ne sera enregistrée ».

**Qui est simulé :** un **rôle, pas une personne**. Un bénévole qui vient d'arriver, sans adhésion ni inscription — sinon un organisateur déjà adhérent ne verrait jamais le formulaire d'adhésion, c'est-à-dire l'objet même de sa vérification. Le formuler dans le bandeau (« comme un bénévole qui découvre la page ») plutôt que de le rendre configurable. Pour le rôle responsable, les affordances sont celles d'un responsable **du secteur consulté** : contextuel, donc aucun sélecteur.

**Cas non couvrable — le visiteur anonyme avant publication.** L'organisateur veut aussi vérifier le rendu réel des liens partagés et des mails. Fournir un **lien d'aperçu partageable** : URL signée, valable quelques jours, rendant l'événement non publié en conditions anonymes réelles. Ouvrable sur mobile ou transmissible à un co-organisateur.

**Inscription réelle d'un organisateur :** prévoir un chemin distinct. Beaucoup d'organisateurs sont aussi bénévoles ; ils ne doivent ni quitter l'aperçu pour s'inscrire, ni s'inscrire par accident depuis l'aperçu.

## 6. Pages d'info en nombre inconnu

Le nombre de pages publiques est à la discrétion de l'organisateur. Deux natures d'entrées doivent donc coexister sans se concurrencer :

- **Structurelles** (Tableau de bord, Secteurs, Mes créneaux) : fournies par le produit, nombre fixe.
- **Éditoriales** (pages d'info) : créées par l'organisateur, nombre libre.

### Mécanismes

1. **Épinglage explicite.** Chaque page d'info a une option « afficher dans la navigation » et un ordre réglable par glisser-déposer, dans l'écran d'administration des pages. Le nombre affiché devient un choix de l'organisateur, pas une fatalité.
2. **Débordement à plafond fixe.** Au-delà de **3 pages épinglées**, les suivantes basculent dans un menu « Plus ». Utiliser un plafond fixe et non un calcul de largeur disponible : le débordement mesuré produit un saut visuel après hydratation, incompatible avec le SSR.
3. **Le débordement ne mange que des entrées éditoriales.** Une page personnalisée ne peut jamais évincer « Secteurs ». Afficher un séparateur visuel entre les deux familles.

### Cas limites

- **0 page** → aucune entrée, aucun menu vide.
- **1 page** → l'entrée porte le nom de la page (« Accès »), pas un menu à un seul élément.
- **Mobile** → le créneau « Infos » absorbe N quelle que soit sa valeur, en ouvrant une feuille listant toutes les pages. À N = 1, ce créneau mène directement à la page. La barre du bas ne défile ni ne déborde.
- **Administration** → « Pages » est une entrée unique menant à une liste. Le N inconnu n'affecte que la navigation de lecture, jamais celle d'édition.

### Découverte

Le tableau de bord de l'événement liste **toutes** les pages d'info en cartes, épinglées ou non. La navigation devient un raccourci vers les pages importantes, pas le seul chemin vers l'information — ce qui rend l'arbitrage de l'organisateur moins lourd de conséquences. Les pages non épinglées restent accessibles par lien direct et via la recherche.

---

## 7. Pages de détail

### 7.1 Choix du traitement

| Mode d'usage | Traitement |
|---|---|
| On y arrive de l'extérieur (mail, notification, recherche), on partage le lien | **Page dédiée** |
| Les enfants sont courts, homogènes et terminaux (on agit dessus directement) | **Accordéon** |
| Le détail est riche et hétérogène, on travaille dans un seul parent à la fois | **Vue liste-détail** |

- **Profil de membre → page dédiée.** Conserver l'existant.
- **Secteur → accordéon.** Conserver l'existant. Les périodes sont terminales : un bénévole les parcourt et s'inscrit. Il a intérêt à survoler plusieurs secteurs avant de choisir, ce que la liste-détail interdit. Sur mobile, l'accordéon évite en plus un aller-retour par secteur.

La hiérarchie ne compte que deux niveaux — un secteur, ses périodes. Il n'existe pas de niveau intermédiaire, donc aucune page de détail n'est nécessaire sous le secteur.

**Deux exigences sur l'accordéon des secteurs :**

1. **L'état ouvert est synchronisé avec l'URL**, carte dépliée et défilée à l'ouverture. Un secteur devient partageable par lien, et surtout ciblable depuis la recherche : un résultat « Bar des Arches » doit atterrir sur le secteur déplié, pas sur la liste. Une seule carte ouverte à la fois, synchronisée sur le chemin.
2. **L'édition profonde sort de l'accordéon.** La carte dépliée porte les affordances légères (renommer, ajouter une période, voir les inscrits). Un formulaire de réglages de secteur, s'il grossit, ouvre un panneau — pas un troisième niveau imbriqué.

### 7.2 Pas de fil d'Ariane

Le chrome reste **totalement invariant** sur les pages de détail : les onglets ne changent pas, l'onglet parent reste actif (un profil de membre *est* dans la section Membres). La navigation latérale reste à un clic.

Le retour à la liste est un **élément de la page**, au même titre que son titre ou ses boutons d'action :

```
[← Tous les membres]

Camille Rochat                                    42 / 128  [↑] [↓]
Responsable · Bar des Arches · membre depuis mars 2025
```

### 7.3 Préservation de l'état

Le retour doit ramener la liste dans l'état où on l'a quittée : mêmes filtres, même tri, même page.

- L'état de la liste vit dans l'URL (query string).
- Chaque ligne pointe vers `…/membres/[id]?from=<querystring encodée>`.
- Le bouton retour reconstruit `…/membres?<from>`, avec repli sur la liste nue si `from` est absent.
- Ne **pas** utiliser `history.back()` : ne survit ni au rechargement ni aux liens partagés.

### 7.4 Précédent / suivant

Les flèches parcourent la liste **filtrée et triée telle qu'elle est**, pas l'ordre global — sinon l'ordre paraît aléatoire. Le paramètre `from` contient déjà ce qu'il faut. Afficher la position (`42 / 128`).

Elles suppriment l'essentiel des allers-retours quand un organisateur traite ses membres un par un.

### 7.5 Comportement mobile

L'accordéon des secteurs fonctionne à l'identique sur mobile : pas de bascule de disposition, pas d'aller-retour supplémentaire. La page dédiée du profil de membre réutilise **le même composant de retour** (« ← Tous les membres »). La barre du bas ne bouge jamais.

---

## 8. Recherche

### Portée

**Limitée au contexte courant, avec sortie explicite vers le global.** Une recherche qui traverse silencieusement la frontière contredirait la promesse du sélecteur. Le mélange local-puis-global crée en outre un risque réel : un homonyme d'un autre événement est visuellement indiscernable, et le nombre de résultats se met à dépendre d'événements sans rapport.

- Le **placeholder annonce la portée** : « Rechercher dans Paléo 2026… ». Pas de pastille de scope dans le champ.
- Un lien en bas du panneau élargit explicitement : « Chercher « x » dans tous mes événements ».

### Familles de résultats

Dans un événement : **Membres / Secteurs / Périodes / Inscriptions** (objets), **Aller à** (pages du contexte), **Actions** (créer un secteur, inviter un membre, publier), **Documentation**.

Dans l'espace Benevio : **Mes événements**, **Aller à** (pages de compte), **Documentation**.

Les familles « Aller à » et « Actions » sont ce qui rend la profondeur de l'arborescence peu coûteuse : un organisateur qui cherche « publier » atteint le réglage sans réfléchir à sa localisation.

### Règles

- **La documentation est la seule source globale**, dans tous les contextes. Elle est en lecture seule et sans ambiguïté d'action possible.
- **Les permissions priment sur le contexte.** Un bénévole ne doit jamais voir la famille « Membres », même vide. Filtrage **côté serveur**, jamais à l'affichage.
- Raccourci `⌘K` / `Ctrl+K`. Plein écran sur mobile.
- L'index par événement est filtré sur `eventId` : trivial à requêter. La recherche globale (union sur toutes les adhésions, vérification des rôles) n'étant déclenchée que sur demande explicite, elle peut se permettre d'être plus lente.

---

## 9. Réorganisations de contenu

- **Dédoublonner les secteurs.** Une seule route `/[eventId]/secteurs`, affordances d'édition selon le rôle. Supprimer la version admin séparée.
- **Fusionner les réglages** — événement, adhésion, thème, publication — en une page `Paramètres` à onglets. Le menu d'administration passe de 9 à 5 entrées.
- **`Page d'aide` n'est pas de la documentation.** C'est du contenu d'événement éditable par l'organisateur : la déplacer dans les pages d'info. Réserver le mot « Documentation » à la documentation produit.
- **Accueil d'événement dépendant du rôle.** Bénévole → mes créneaux et bouton s'inscrire. Responsable → inscriptions en attente de validation. Organisateur → vue d'ensemble. C'est la page la plus visitée : elle doit répondre à « qu'est-ce que je fais maintenant ? ».
- **État de publication** visible en permanence pour les rôles d'administration (pastille dans la ligne 1, ou bas de sidebar).

---

## 10. Arborescence de routes cible

```
src/routes/
  (site)/
    +layout.svelte                    # shell espace Benevio
    +page.svelte                      # landing
    tarifs/ open-source/ cgu/
    evenements/                       # annuaire public
    docs/[...slug]/                   # documentation
  (account)/
    me/+layout.svelte
    me/+page.svelte                   # mes événements
    me/profil/ me/achats/ me/preferences/
  [eventId]/
    +layout.server.ts                 # event + member + permissions, une fois
    (public)/
      +layout.svelte                  # top bar + ligne 2
      +page.svelte                    # tableau de bord selon rôle
      teams/                          # liste des secteurs — chemin existant conservé
        +page.svelte                  # liste, aucune carte dépliée
        [teamId]/+page.svelte         # même liste, carte dépliée et défilée
      creneaux/
      p/[pageSlug]/                   # pages d'info
    (admin)/
      +layout.svelte                  # sidebar
      membres/+page.svelte
      membres/[memberId]/+page.svelte
      inscriptions/ planification/ pages/
      parametres/[tab]/
```

`teams/[teamId]` rend **la même liste** que `teams/`, avec la carte correspondante dépliée : ce n'est pas une page distincte mais un état de la liste porté par l'URL. Le composant est donc partagé.

**Redirections permanentes obligatoires** depuis toutes les anciennes URLs : les organisateurs partagent des liens directs vers des pages d'événement par mail à leurs bénévoles, et ces mails sont déjà partis.

---

## 11. Documentation du site

La documentation vit dans l'espace Benevio (`/docs`), avec une sidebar propre à cette section — un niveau 3, pas une nouvelle barre. Sur mobile, la sidebar devient une feuille « Sommaire ».

L'icône `?` de la ligne 1 ouvre un panneau latéral avec 2–3 liens profonds vers les pages pertinentes pour l'écran courant, plus un lien vers la documentation complète. L'utilisateur ne quitte jamais son contexte.

Structure, par intention plutôt que par fonctionnalité :

- **Démarrer** — un tutoriel linéaire, de la création du compte à un événement publié avec un premier bénévole inscrit.
- **Guides** — par rôle (organisateur, responsable, bénévole), une page par tâche.
- **Concepts** — le modèle de domaine : événement, secteur, période, membre, inscription, adhésion. *À écrire en premier* : le vocabulaire du produit n'est explicite nulle part, et c'est la cause racine commune de la confusion de navigation et du besoin de documentation.
- **Référence** — écran par écran, champ par champ. Cible de l'aide contextuelle.
- **Auto-hébergement et contribution** — remplace la page « Open source » actuelle.

Markdown dans le repo, rendu par mdsvex, **slugs stables** (l'aide contextuelle pointe dessus). Permet les corrections par PR.

---

## 12. Ordre de mise en œuvre

Les trois premiers lots sont indépendants et livrables séparément.

1. **Fusion des réglages** en page à onglets. Aucun impact sur le reste.
2. **Suppression du doublon secteurs**, avec affordances selon le rôle.
3. **Accueil d'événement adaptatif** au rôle.
4. **Navigation comme données** (`getNavigation`) — prérequis technique du lot suivant.
5. **Sélecteur de contexte + shells** (top bar, sidebar admin, barre du bas mobile) + groupes de layout + redirections.
6. **Recherche** (`⌘K`, portée contextuelle, familles de résultats). Probablement le meilleur retour sur investissement de la refonte : elle rend la profondeur de l'arborescence beaucoup moins coûteuse, et donc les futurs arbitrages de navigation moins critiques.
7. **Secteurs** : synchronisation de la carte dépliée avec l'URL, retour préservant l'état et précédent/suivant sur les listes.
8. **Documentation** (`/docs`, aide contextuelle).

---

## 13. Critères d'acceptation

- [ ] Le sélecteur ne contient que « Benevio » et les événements de l'utilisateur — jamais de page de compte.
- [ ] Un utilisateur avec un seul espace ne voit ni chevron ni menu déroulant.
- [ ] Aucun écran n'affiche deux logos simultanément.
- [ ] Un événement sans logo affiche un repli en initiales, jamais un espace vide.
- [ ] La ligne 1 ne dépasse jamais 5 emplacements.
- [ ] Les entrées de la barre du bas mobile sont identiques, dans le même ordre, à celles de la ligne 2 desktop du même contexte et rôle.
- [ ] Avec 12 pages d'info épinglées, la barre ne casse pas et « Secteurs » reste visible.
- [ ] Avec 0 page d'info, aucun menu vide n'apparaît. Avec 1, aucun menu à un seul élément.
- [ ] Le retour depuis un profil de membre restaure filtres, tri et page de la table.
- [ ] Les flèches précédent/suivant suivent l'ordre filtré affiché, pas l'ordre global.
- [ ] Un bénévole ne reçoit jamais de résultat de recherche appartenant à une famille réservée à l'administration, y compris via appel API direct.
- [ ] Sur `/teams`, un organisateur en vue bénévole ne voit aucun secteur en brouillon, aucun contrôle d'édition et aucune donnée de gestion.
- [ ] Les entrées « Secteurs » de la top bar et de la sidebar pointent vers la même URL, et une seule est surlignée à la fois.
- [ ] Un utilisateur sans droits d'administration obtient la vue bénévole même en forçant le paramètre `?view=`.
- [ ] Une invitation en attente apparaît dans le menu du sélecteur, sans avoir à rouvrir le mail.
- [ ] Avec 15 événements dont 12 terminés, le menu reste lisible sans défilement pour atteindre les événements actifs.
- [ ] Basculer depuis `/[a]/membres/42` mène à la liste des membres de `[b]`, ou à son accueil si le rôle ne le permet pas — jamais à une URL inexistante.
- [ ] Basculer vers un événement où l'utilisateur est simple bénévole affiche la top bar en vue bénévole, quel que soit le mode quitté.
- [ ] La vue bénévole vue par un administrateur affiche toujours le bandeau d'aperçu, sur desktop comme sur mobile.
- [ ] « Quitter l'aperçu » revient à la même URL en mode administration.
- [ ] L'aperçu en « visiteur non connecté » masque les données réservées aux membres et n'affiche aucun secteur en brouillon.
- [ ] En aperçu, soumettre le formulaire d'adhésion affiche l'écran de confirmation sans créer d'adhésion, sans envoyer de mail et sans appeler le prestataire de paiement.
- [ ] En aperçu, s'inscrire sur un secteur complet affiche le vrai message d'erreur de capacité.
- [ ] Les compteurs de places ne bougent pas après une inscription simulée.
- [ ] Un organisateur déjà adhérent voit bien le formulaire d'adhésion en aperçu.
- [ ] Un résultat de recherche pointant sur un secteur ouvre la liste avec la carte dépliée et défilée, pas la liste fermée.
- [ ] L'URL d'un secteur déplié est partageable et restitue le même écran au rechargement.
- [ ] Toutes les anciennes URLs d'événement redirigent en 301.
- [ ] Les 5 parcours principaux tiennent en ≤ 2 clics depuis l'accueil du contexte concerné : un bénévole s'inscrit sur un créneau ; un responsable valide une inscription ; un organisateur crée un secteur ; un organisateur invite un membre ; un bénévole consulte ses créneaux.

---

## 14. Décisions écartées

Ne pas réintroduire sans nouvelle discussion.

| Alternative | Motif du rejet |
|---|---|
| Fil d'Ariane dans le chrome | Ajoute un élément et fait varier la barre. Le retour intégré à la page fait le même travail sans toucher au chrome. |
| Deux logos (Benevio + événement) en fil d'Ariane | Coûte de la largeur, hiérarchie fragile face à un logo téléversé fort, et perd la sensation « site de l'événement ». |
| Sidebar partout, y compris côté bénévole | Fait « back-office » sur les pages publiques, alors que la partie bénévole représente l'essentiel du trafic. |
| Fusion des deux lignes du header | Serré dès 900px en mode administration, et la teinte signalant les coulisses perd sa surface. |
| Pastille de portée dans le champ de recherche | Redondante avec le placeholder. |
| Recherche globale avec résultats locaux en tête | Homonymes indiscernables entre événements, risque d'agir sur la mauvaise donnée, résultats imprévisibles. |
| Débordement mesuré (priority+) | Saut visuel après hydratation, incompatible avec le SSR. Plafond fixe à la place. |
| Menu hamburger mobile côté bénévole | Cache la navigation derrière un tap pour la population la plus nombreuse et la moins experte. |
| Navigations publique et admin visibles en permanence (état actuel) | Impossible à tenir sur mobile, donc deux modèles mentaux selon la taille d'écran. Produit deux états actifs simultanés sur les pages partagées comme `/teams`. Fait apparaître la sidebar sans explication lorsqu'un bénévole est promu. |
| Troisième barre persistante | Recrée exactement le croisement de contextes que cette refonte supprime. Le niveau 3 est en onglets dans la page. |
