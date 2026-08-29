- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Auto-accepte des inscriptions sur les membres sans compte est peut-être un raccourcie non nécéssaire. Par exemple, si une invitation est en cours pour un membre et qu'un responsable l'inscrit à une période, le membre n'aurra pas eu le temps de lié sont compte et son l'inscription sera automatiquement validé.

- [ ] Réaliser un audit de sécurité

- [ ] Revoir le layout de /admin/teams/[teamId]
  - [ ] Formulaire
  - [ ] Globale
  - [ ] Drawer (le passer en overlay)

- [ ] Revoir le layout de /admin/members/[memberId] sur écran large

- [ ] Questionner la pertinence de la liste des secteurs dans le dashboard benev/src/routes/[eventId]/admin/dashboard/+page.svelte:124

- [ ] Permetre d'ajouter des champs de profile directement dupuis la fiche de profil d'un membre.

- [ ] Dans le menu de navigation principal, Supprimer le lien "open source", ajouter "Documentation" et "prix", adappter un peu mieux responsive.

- [ ] Dans le plan, faire en sorte que les périodes avec la même étiquête soit sur la même ligne quand il y en à plusieur. Peut-être qu'un simple tri sur la première étiquète suffit. J'espère en tout cas.

- [ ] Détecter et journaliser les emails qui non pas été recu par la destinataire.

- [ ] Placer l'indicateur de quota dans la section "Status" des settings

- [ ] Placer le bouton supprimer du secteur dans les actions au lieu de dans la section "danger"

- [ ] S'assurer que tous les thermes utilisé dans l'app soit inclusif.

- [ ] La liste des invitations est moche

- [ ] Onboarding de l'organisateur
  - [ ] La page d'aide en placeholder de la page d'accueil est confuse
  - [ ] La page admin par défaut doit être le dashboard
  - [ ] Mettre un message de bienvenu dans le journal

- [ ] Quand on pase d'un événement à l'autre, le formulaire dans settings ne ce met pas à jour. Simplement mettre .for(id) au formulaire résous, le problème, mais les issues de formulaire ne remonte plus.
