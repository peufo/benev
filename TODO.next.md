- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Les pages devrait avoir un status "draft" | "published"

- [ ] Le formulaire des badges completement buguer

- [ ] Il faut supprimer MemberImportDialog et faire un vrai outil d'importation capable de prendre comme source, un fichier csv ou un autre événement. Suivi d'une vue pour mapper les colonnes.

- [ ] Auto-accepte des inscriptions sur les membres sans compte est peut-être un raccourcie non nécéssaire. Par exemple, si une invitation est en cours pour un membre et qu'un responsable l'inscrit à une période, le membre n'aurra pas eu le temps de lié sont compte et son l'inscription sera automatiquement validé.

- [ ] Sur le profile de membre, mettre en avant les champs requis avec une information manquante. (profile + info de contact)

- [ ] Réaliser un audit de sécurité

- [ ] Revoir le layout de /admin/teams/[teamId]
  - [ ] Formulaire
  - [ ] Globale
  - [ ] Drawer (le passer en overlay)

- [ ] Revoir le layout de /admin/members/[memberId] sur écran large

- [ ] Questionner la pertinence de la liste des secteurs dans le dashboard benev/src/routes/[eventId]/admin/dashboard/+page.svelte:124
