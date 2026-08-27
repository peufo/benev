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
