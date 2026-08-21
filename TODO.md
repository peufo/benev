Dans src/lib/InviteForm.svelte il faut:

- placer le non et prénom avant l'email
- mentionner que l'email est optionel
- Ajouter un champ boolean, disable si l'email n'est pas renseigné, activé par défaut, qui permet de désactiver l'envoie de l'invitation par email
- Dans le hint du champ, si l'événement n'est pas publié, il faut mentionner à quoi l'utilisateur aura accèes (en fonction de son rôle).
