- [x] Les textes à l'intérieur des tags ne doivent pas wrap. Il doivent plutôt ellipsis ...

- [x] Le formulaire des badges (/admin/pages/badges/) est completement bugguer. Comme pour les autres publications, le formulaire doit utiliser la savebar.

- [ ] Revoir le layout des publications (src/routes/[eventId]/admin/pages/+layout.svelte). Il faut séparer la section "Navigation" du reste. Sur mobile, le comportement doit être semblable à /admin/teams. La partie qui concerne l'édition des badges peut également être découpé en deux partie (formulaire / apercu)

- [ ] Permetre d'ajouter des champs de profile directement dupuis la fiche de profil d'un membre.

- [ ] S'assurer que tous les termes utilisé dans l'app soit inclusif.

- [ ] Quand on passe d'un événement à l'autre, le formulaire dans settings ne ce met pas à jour. Simplement mettre .for(id) au formulaire résous, le problème, mais les issues de formulaire ne remonte plus.

- [ ] Un responsable doivent quand même avoir accès au journal dans le dashboard et dans la fiche de membre

- [ ] Les deux pages "Tu dois être administrateur pour accéder à cette page" sont diférentes (/admin/pages et /admin/settings)
