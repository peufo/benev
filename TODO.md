- [x] Ajouter un placholder benev/src/lib/period/PeriodForm.svelte:195
- [x] Mise à jour des CGU

- [ ] benev/src/lib/view/TableViewSelect.svelte:19 ajouter des clés a ignorés (ex: benev/src/lib/plan/PlanHeader.svelte:70 devrait ignorer form_milstone)

- [ ] Le style des champs du formulaire de profile sont à revoir (Champs obligatoire, oui/non, ...)

- [ ] Affichage de mon profile /me à revoir

- [ ] src/lib/member/MemberCreateSubscribeDialog.svelte Le dialog doit se rafraichire entre deux inscriptions

- [ ] src/lib/member/MemberProfileFormButton.svelte Les valeur ne sont pas injecté dans le formulaire. A voir si on passe pas sur un système d'édition inline
  - [ ] En cliquant sur la représentation en lecture seul (vue profile ou cellule de tableau), on replace l'élément par un input
  - [ ] Une fois les modification faite, on les valides avec la SaveBar
  - [ ] Le système doit fonctionner à la fois sur la table, et a la fois sur le profile
