- [ ] benev/src/lib/view/TableViewSelect.svelte Utilisé Il faut normaliser le style et utiliser Popover au lieu de Dropdown. Utilise directement InputSelect si possible.

- [ ] Les filtres de table des colonne de type nombre doivent être réparé (style et utilisation)

- [ ] Tous les drawers doivent avoir la classes 'surface-drawer'

- [ ] Le formulaire d'édition des champs est completement cassé

- [ ] Quand on soumet un formulaire invalide, le champ se vide: benev/src/lib/event/settings/SectionEssentiel.svelte:55

- [ ] le slider "Opacité des surface" réagit mal à la réinitialisation

- [ ] La modification des pages doit avoir un bouton "Submit" plutôt qu'un système auto-submit

- [ ] src/lib/material/media/SelectMedia.svelte Doit devenir un drawer pouvant être instancier une seul fois. Le composant peut être renommé. L'aspect des élément existants doit être le même que InputMedia.svelte. Il faut trouver un moyen simple de faire communiquer InputMedia et SelectMedia.

- [ ] benev/src/lib/api.ts:54 Il faut supprimer l'api. Les derniers usages de celle-ci doivent être convertient en fonction remote query
