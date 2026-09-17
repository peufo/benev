src/routes/[eventId]/admin/pages/[pageId]/+page.svelte le titre et icon de section est redondant avec le champ "type de page". Il peut être supprimer. Et le champ de changement de status peut être placer sur la même ligne que les champs "Titre" et "Type de page". Le status peut faire partie intégrante du formulaire.

Le icône "draft" doivent être cohérent pour tout les éléments (event, team, page). Utilise l'icon PickaxeIcon de couleur orange partout. Même dans les pages non publié dans l'entête

Est-ce que le champ "Fin de inscriptions" fait encore sens ? On devrait plutôt avoir un moyen pour programmer les changements de status "validated" <-> "published".

Supprimer la page d'aide. Les liens du message de bienvenue et du menu de navigation doivent renvoyer vers la doc.

Pour les badges "Configuration" -> "Configuration d'un badge"

Gerer les modifications de créneaux ayant des inscriptions d'un secteur valider
