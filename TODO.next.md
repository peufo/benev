- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Les pages devrait avoir un status "draft" | "published"

- [ ] Affichage de mon profile /me à revoir

- [ ] Le style des champs du formulaire de profile sont à revoir (Champs obligatoire, oui/non, ...)
- [ ] src/lib/member/MemberProfileFormButton.svelte Les valeur ne sont pas injecté dans le formulaire. A voir si on passe pas sur un système d'édition inline
  - [ ] En cliquant sur la représentation en lecture seul (vue profile ou cellule de tableau), on replace l'élément par un input
  - [ ] Une fois les modification faite, on les valides avec la SaveBar
  - [ ] Le système doit fonctionner à la fois sur la table, et a la fois sur le profile

- [ ] L'édition des étiquettes benev/src/lib/period/PeriodForm.svelte:191
  - [ ] Mettre a jour ou supprimer une étiquette ne l'update pas dans le formulaire du dessous
