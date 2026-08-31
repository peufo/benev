- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Auto-accepte des inscriptions sur les membres sans compte est peut-être un raccourcie non nécéssaire. Par exemple, si une invitation est en cours pour un membre et qu'un responsable l'inscrit à une période, le membre n'aurra pas eu le temps de lié sont compte et son l'inscription sera automatiquement validé.

- [ ] Réaliser un audit de sécurité

- [ ] Dans le menu de navigation principal, Supprimer le lien "open source", ajouter "Documentation" et "prix", adappter un peu mieux responsive.

- [ ] Détecter et journaliser les emails qui non pas été recu par la destinataire.

- [ ] Placer l'indicateur de quota dans la section "Status" des settings

- Les éléments highlight sont moche
  - La liste des invitations benev/src/routes/(home)/me/events/+page.svelte:38
  - La période listé dans benev/src/routes/(home)/me/events/EventEntry.svelte:94 (A supprimer ?)

- [ ] Onboarding de l'organisateur
  - [ ] La page d'aide en placeholder de la page d'accueil est confuse
  - [ ] La page admin par défaut doit être le dashboard
  - [ ] Mettre un message de bienvenu dans le journal

- [ ] La croix pour quitter le formulaire d'adhésion ne devrait pas permetre de supprimé l'adhésion

- [ ] Le filtre du journal devrait utilisé un InputSelect (également dans /root/logs)
