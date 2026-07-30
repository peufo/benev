## Comportement général à retenir

### Timezone et formatage

Tojours utiliser src/lib/formatRange.ts pour le formatage des durées.
Il faut également faire très attention à la timezone (il faut soit la fournir coté server, soit utilisé src/lib/timezone.ts)

### Migration fuma

Il faut se débarrasser autant que possible des composants fuma-legacy pour privilégier la nouvelle version de fuma.
Par exemple DropDown devient Popover. Assure-toi que c'est bien noté.

## Revue de codes

Corrige les points suivants et fait en sort que cela ne ce repoduise pas:

### benev/src/lib/fuma-legacy/ui/input/InputImage.svelte:7

Ne plus utiliser le composant Icon de fuma-legacy avec mdijs. A la place, il faut utilisé les icons svelte-lucide avec le suffix. ex: CheckIcon

### benev/src/lib/me/IsOrganizerForm.svelte:15

Evite et supprime les commentaire de modifications. Les rapports suffisent.
Seule les commentaires vouée à rester dans la temps sont pertinents.
