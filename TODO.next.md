- [ ] https://github.com/peufo/benev/issues/127 Ajouter les status / visibilité pour les secteurs de travail
  - [ ] Définir la meilleur approche: {status: 'draft' | 'valided', published: boolean} ou {status: 'draft' | 'valided' | 'published'}
  - [ ] Le drawer "Ordre des secteurs" pourrais permettre de choisir qu'elle secteurs sont publiés.

- [ ] Les pages devrait avoir un status "draft" | "published"

- [ ] Le formulaire des badges completement buguer

- [ ] Il faut supprimer MemberImportDialog et faire un vrai outil d'importation capable de prendre comme source, un fichier csv ou un autre événement. Suivi d'une vue pour mapper les colonnes.

- [ ] Dans le mail d'invitation, on peux ajouter un token dans le lien. Grâce à lui, on peut identifié l'utilisateur sur la page de login, placer le formulaire en mode "register" si nécéssaire et pré-remplir le champ email, et valider l'adresse email directement.

- [ ] Il faut ajouter la possibilité d'envoyer une nouvelle invitation à la demande a partire de la fiche de membre. Cela couvre le cas ou on change/corrige l'email du membre.

- [ ] Auto-accepte des inscriptions sur les membres sans compte est peut-être un raccourcie non nécéssaire. Par exemple, si une invitation est en cours pour un membre et qu'un responsable l'inscrit à une période, le membre n'aurra pas eu le temps de lié sont compte et son l'inscription sera automatiquement validé.

- [ ] Sur le profile de membre, mettre en avant les champs requis avec une information manquante. (profile + info de contact)

- [ ] Abandonner le chantier entamé lié au Gift benev/prisma/schema.prisma:469 et nettoyer le code mort qui est lié

- [ ] Réaliser un audite de sécurité

- [ ] Revoir le layout de /admin/teams/[teamId]
  - [ ] Formulaire
  - [ ] Globale
  - [ ] Drawer (le passer en overlay)

- [ ] Revoir le layout de /admin/members/[memberId] sur écran large

- [ ] Questionner la pertinence de la liste des secteurs dans le dashboard benev/src/routes/[eventId]/admin/dashboard/+page.svelte:124
