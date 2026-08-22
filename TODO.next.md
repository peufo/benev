- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Les pages devrait avoir un status "draft" | "published"

- [ ] Le formulaire des badges completement buguer

- [ ] Il faut supprimer MemberImportDialog et faire un vrai outil d'importation capable de prendre comme source, un fichier csv ou un autre événement. Suivi d'une vue pour mapper les colonnes.

- [ ] Dans le mail d'invitation, on peux ajouter un token dans le lien. Grâce à lui, on peut identifié l'utilisateur sur la page de login, placer le formulaire en mode "register" si nécéssaire et pré-remplir le champ email, et validé l'adresse email directement.

- [ ] Sur le profile de membre, mettre en avant les champs requis avec une information manquante. (profile + info de contact)

- [ ] La liste d'administration des secteurs doit être revue car les cartes extensible ne sont pas très adapté pour de l'admin. Mais c'est ok pour la vue publique. Il faut donc deux page distinct qui liste les secteurs. Une publique, et une pour l'admin.
  - [ ] Sur la gauche, la liste des secteurs plutôt dense. If faut la possibilité de filtrer en faisant un recherche. Les secteurs dont on est responsable doivent être mise en avant par rapport aux autres. Sachant qu'un responsable n'as qu'un droit de lecture sur les autres secteurs.
  - [ ] Quand un secteur est selectionné ([eventId]/admin/teams/[teamId]), on affiche toute ses infos ainsi que la liste de ses périodes
  - [ ] Sur mobile la surface listant les secteurs ne peut pas s'afficher en même temps que le secteur séléctionné. La navigation ([eventId]/admin/teams <-> [eventId]/admin/teams/[teamId]) doit donc être agréable
