- [x] Si une étiquette est créer et que PeriodForm est ouvert, il faut automatiquement seléctionner l'étiquette qui vient d'être créer

- [x] Dans le plan, le zoom à la roulette de souris n'est pas du tous fluide. Je crois qu'il n'y a pas de debounce stocker la valeur dans l'url.

- [x] benev/src/lib/plan/magnet.ts:5 Ne plus utiliser la store ctrl (a supprimer) et transformer en state.

- [x] Quand on clique sur le plan, au lieu d'ouvrir le formulaire de création de période sans durée, on devrais plutôt inviter l'utilisateur à faire un cliqué-glissé.

- [ ] Normaliser le style des drawers

- [ ] Dans le plan, il faut afficher le ghost de la création de période au survole de la souris

- [ ] Comment faire en sorte que benev/src/lib/plan/positionIndicator.ts:15 soit appeler dans le même tick que la modification du zoom ?

- [ ] src/lib/period/InputDateTime.svelte cette input est bien, mais il n'est pas à ca place. Il faut l'ajouter à fuma, l'adapter pour qu'il ai une interface cohérente avec les autres Composant Input, et l'utilisé pour src/lib/ui/range/RangePickerButton.svelte et src/lib/ui/table/head/TableHeadDate.svelte

- [ ] src/lib/member/conditions/MemberConditions.svelte Les changement de valeur dans les input de sont pas pris en compte. J'ai déjà réparé "Age minimum" avec un listener "oninput". Mais c'est pas top comme solution
