- [ ] Tester l'outil de duplication d'événement + repasser sur l'estétique

- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Auto-accepte des inscriptions sur les membres sans compte est peut-être un raccourcie non nécéssaire. Par exemple, si une invitation est en cours pour un membre et qu'un responsable l'inscrit à une période, le membre n'aurra pas eu le temps de lié sont compte et son l'inscription sera automatiquement validé.

- [ ] Réaliser un audit de sécurité

- [ ] Détecter et journaliser les emails qui non pas été recu par la destinataire.

- [ ] Placer l'indicateur de quota dans la section "Status" des settings

- [ ] Dans le menu de navigation principal, Supprimer le lien "open source", ajouter "Documentation" et "prix", adapter un peu mieux responsive.

- [ ] Limiter le nombre de pages d'un événement (4 pages suffise)

- [ ] Nouvelle navigation
  - [ ] pages: Au lieu de ce transformé en menu sandwich les pages du header doivent se transformé en onglets (je pense que ca doit rester en haut de page dans une prolongation du header).
    - [ ] event: Etant donner qu'on ne métrise pas le nombre de page d'une événement, on peut regrouper les pages secondaire dans un onglet "Info"
    - [ ] event: Le lien vers /[eventId]/me doit ce trouver dans la liste des pages (Au lieu de cliquer sur le nom de l'événement en haut à gauche)
    - [ ] landing: On a que 4 liens, ca passe
    - [ ] admin: La page d'aide étant remplacé par la vrai doc, le quota peut être placer dans la section "statut" de la configuration, le lien vers /admin/pages peut être placer dans les settings (TOC ou section pour être accéssible en mobile). Ca réduit le nombre d'onglet à 6. Ce qui devrait être résonnable pour être placer horizontalement
  - [ ] context: Le changement de context ce fait via un menu

- Vérifié que l'option "Compté par combinéson" est bien implémenté
