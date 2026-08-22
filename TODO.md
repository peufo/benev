- [ ] benev/src/lib/log/logMap.ts:163 il faut un LogUpdate même pour les champs personalisé (pas la peine de se soucier de la migration des données on est pas en prod)

- [ ] Il faut reset src/lib/InviteForm.svelte après un success

- [ ] Ajouter un LogType event_create

- [ ] Dans la table des inscriptions, il faut ajouter la date de la création de l'inscription et mettre les plus récentes en avant.

- [ ] Plutôt qu'une vue dédier au journal, il faut créer faire un dashboard qui inclue trois sections en plus du journal :
  - [ ] Quelque chiffres clés
  - [ ] La liste des derniers adhérents
  - [ ] La liste des inscription à valider par un responsable

- [ ] Inclure l'input pour créer des notes dans l'encadré du journal

- [ ] Séparer la vue du membre en trois sections
  - [ ] Profil (photo, contact, champs personalisés )
  - [ ] Inscriptions
  - [ ] Secteurs à charge
  - [ ] Journal
