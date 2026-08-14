- [ ] Regrouper les pages settings
  - [ ] EventForm.svelte, utilisé pour la création, peut ne contenir que l'essentiel du formulaire (on supprime les cartes "Identitée" et "Pied de page")
  - [ ] Regrouper les sections "Identité" et "Apparence". Les InputImagePreview qui était utilisé dans EventForm pour la création peuvent être remplacé par des InputMedia.

- [ ] benev/src/lib/view/TableViewSelect.svelte Utilisé Il faut normaliser le style et utiliser Popover au lieu de Dropdown. On peut peu être utiliser directement InputSelect ?

- [ ] Les filtres de table des colonne de type nombre doivent être réparé

- [ ] Les changement d'ordre de liste doivent utiliser l'icon MoveVerticalIcon au lieu de GripIcon
  - [ ] "Champs du profil de membre"
  - [ ] "Ordre des secteurs"

- [ ] Tous les drawers doivent avoir la classes 'surface-drawer'

- [ ] Le formulaire d'édition des champs est completement cassé

- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Quand on soumet un formulaire invalide, le champ se vide: benev/src/lib/event/settings/SectionEssentiel.svelte:55

- [ ] /[eventId]/me De nombreux style sont cassés

- [ ] La modification des pages doit avoir un bouton "Submit" plutôt qu'un système auto-submit
- [ ] Les pages devrait avoir un status "draft" | "published"

- [ ] InputMedia est bien, mais il faut revoir le dialog mediateque

- [ ] La SaveBar doit être plus visible
