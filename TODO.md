- [ ] benev/src/lib/view/TableViewSelect.svelte Utilisé Il faut normaliser le style et utiliser Popover au lieu de Dropdown. On peut peu être utiliser directement InputSelect ?

- [ ] Les filtres de table des colonne de type nombre doivent être réparé

- [ ] Tous les drawers doivent avoir la classes 'surface-drawer'

- [ ] Le formulaire d'édition des champs est completement cassé

- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Quand on soumet un formulaire invalide, le champ se vide: benev/src/lib/event/settings/SectionEssentiel.svelte:55

- [ ] /[eventId]/me De nombreux style sont cassés

- [ ] La modification des pages doit avoir un bouton "Submit" plutôt qu'un système auto-submit
- [ ] Les pages devrait avoir un status "draft" | "published"

- [ ] src/lib/material/media/SelectMedia.svelte Doit devenir un drawer pouvant être instancier une seul fois. Le composant peut être renommé. L'aspect des élément existants doit être le même que InputMedia.svelte.

- [ ] La SaveBar doit être plus visible

- [ ] benev/src/lib/api.ts:54 Il faut supprimer l'api. Les derniers usages de celle-ci doivent être convertient en fonction remote query
