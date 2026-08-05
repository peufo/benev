- [x] src/lib/plan/PeriodCard.svelte:36 Les périodes ne sont pas mise à jour. handleGrabDone() a peut être un problème.

- [x] benev/src/lib/period/PeriodForm.svelte:87 Une fois la période suivante créer à l'aide du bouton "Dupliquer après", c'est elle qui doit remplir le formulaire.

- [x] benev/src/lib/period/PeriodForm.svelte:203 Le champ ne se met pas à jour quand on change de période
	(non reproductible : corrigé par 054bc959, `setPeriod()` fait déjà `fields.maxSubscribe.set()`)

- [ ] Si une étiquette est créer et que PeriodForm est ouvert, on peut séléctionné l'étiquette

- [x] Sur le plan ,les boutons pour modifier les périods doivent être plus représentatif de ce qu'il permettent de faire.

- [ ] L'effet de hover ne fonctionne plus sur les lignes du plan

- [ ] Le clique sur le label de InputMultiSelect ne déclenche pas le popover

- [ ] Le focusout de InputSelect et InputMultiSelect devrait fermer le popover

- [ ] Dans le plan, le zoom à la souris n'est pas du tous fluide. Je crois qu'il n'y a pas de debounce stocker la valeur dans l'url.
