src/lib/member/MemberProfileForm.svelte doit être améliorer pour remplacer src/lib/member/MemberProfile.svelte qui pourra être supprimé.

Le Drawer qui contient MemberProfileForm devient également obsolète (ex: benev/src/routes/[eventId]/admin/members/+page.svelte:192). L'objectif est de rendre l'édition du profile plus direct. L'édition directement sur la table est une tâche ulterieur.

MemberProfileForm doit:

- Pouvoir rester tels quel dans le formulaire d'adhdésion (/register)
- Inclure un mode compacte ou les champs a choix deviennent des InputSelect plutôt que des InputRadio ou InputCheckboxes
- Pouvoir utiliser SaveBar au lieu de la validation classique

Le mode compact et SaveBar sera utile au endroit ou on remplace MemberProfile.
