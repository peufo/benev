- [ ] src/lib/plan/PeriodCard.svelte:36 Les périodes ne sont pas mise à jour correctement handleGrabDone() à peut être un problème.

- [ ] benev/src/lib/period/PeriodForm.svelte:87 Une fois la période suivante créer, c'est elle qui doit remplir le formulaire.

- [ ] benev/src/lib/period/PeriodForm.svelte:203 Le champ ne se met pas à jour quand on change de période

- [ ] Si une étiquette est créer et que PeriodForm est ouvert, on peut séléctionné l'étiquette

- [ ] benev/src/lib/period/PeriodForm.svelte:60 J'ai une erreur 500 malgré l'utilisation de bun 1.2.22 TypeError: Intl.DurationFormat is not a constructor
      at formatDuration (src/lib/period/PeriodForm.svelte:64:10)
      at $$render_inner (src/lib/period/PeriodForm.svelte:226:10)
      at eval (src/lib/period/PeriodForm.svelte:420:5)
      at Renderer.child (node_modules/svelte/src/internal/server/renderer.js:214:18)
      at Renderer.component (node_modules/svelte/src/internal/server/renderer.js:319:22)
      at PeriodForm (src/lib/period/PeriodForm.svelte:36:13)
      at children (src/lib/period/PeriodDrawer.svelte:49:40)

- [ ] Les boutons pour modifier les périods doivent être plus représentatif de ce qu'il permettent de faire.
