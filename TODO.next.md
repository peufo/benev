- [ ] Tester l'outil de duplication d'événement + repasser sur l'estétique

- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Détecter et journaliser les emails qui non pas été recu par la destinataire.

- [ ] Vérifié que l'option "Compté par combinéson" est bien implémenté

- [ ] Limiter la longueur des créneau à 7 jours. Sinon ca casse l'affichage dans la plannif

- [ ] Nouvelle navigation
  - [ ] Limiter le nombre de pages d'un événement (6 pages suffisent largement)
  - [ ] Placer l'indicateur de quota dans la section "Status" des settings
  - [ ] pages: Au lieu de ce transformer en menu sandwich les pages du header doivent se transformé en onglets (je pense que ca doit rester en haut de page dans une prolongation du header, mais en bas prêt du pousse, ca peut être bien aussi, si c'est pas trop compliqué).
    - [ ] event: Etant donner qu'on ne métrise pas le nombre de page d'une événement, on peut regrouper les pages secondaire dans un onglet "Info"
    - [ ] event: Le lien vers /[eventId]/me doit ce trouver dans la liste des pages (Au lieu de cliquer sur le nom de l'événement en haut à gauche)
    - [ ] landing: On a que 4 liens, ca passe
    - [ ] admin: La page d'aide étant remplacé par la vrai doc, le quota peut être placer dans la section "statut" de la configuration, le lien vers /admin/pages peut être placer dans les settings (TOC ou section pour être accéssible en mobile). Ca réduit le nombre d'onglet à 6. Ce qui devrait être résonnable pour être placer horizontalement
  - [ ] context-admin: Pour les responables, un toogle de devrait etre dispo dans le header. Un indicateur visuel doit facilement nous faire comprendre qu'on est en mode admin.
  - [ ] context-global: Le bouton en haut à gauche ouvrir un menu (Petite liste de mes événements, Lien vers tous les événements, Lien vers la documentation)

- [ ] L'avatar en haut à droite doit ouvrir un menu (Mon compte, Mes événements, (Mes achats), Déconnexion)

- [ ] Le message de bienvenue du journal doit pointer sur la doc. + Il faut trouver un endroit ou mettre le lien vers la doc.

- [ ] Dans l'édition des page (models d'email + page) le titre de la carte est en trop

- [ ] L'ordre des pages doit pouvoir être changer depuis la list (listEditable). De la même manière que les secteurs.
