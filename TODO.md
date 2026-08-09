- [x] Est-ce possible de faire en sorte que benev/src/lib/plan/positionIndicator.ts:15 soit appeler dans le même tick que la modification du zoom ?

- [ ] src/lib/period/InputDateTime.svelte cette input est bien, mais il n'est pas à ca place. Il faut l'ajouter à fuma, l'adapter pour qu'il ai une interface cohérente avec les autres Composant Input, et l'utilisé pour src/lib/ui/range/RangePickerButton.svelte et src/lib/ui/table/head/TableHeadDate.svelte

- [ ] src/lib/member/conditions/MemberConditions.svelte Les changement de valeur dans les input de sont pas pris en compte. J'ai déjà réparé "Age minimum" avec un listener "oninput". Mais c'est pas top comme solution. De plus il faudrait utiliser les Input de fuma au lieu de checkbox native.

- [ ] benev/src/routes/(home)/+page.svelte:64 Le logo représenté par le composant AnimatedLogo.svelte n'est plus d'actualité. Le nouveau logo est src/lib/assets/logo.svg pour le compact/carré et src/lib/assets/benevio.webp pour la version en toutes lettre. Utilise impeccable pour integrer les nouvelles couleurs dans la charte et pour revoir le hero.

- [ ] fuma/src/lib/ui/drawer/Drawer.svelte:2 transitionX doit être un state au lieu d'un store.
