/**
 * ## Modèles zod et remote functions
 *
 * Ces modèles sont réécrits **en place** pour être compatibles `form()`, plutôt que dédoublés
 * en « schéma formulaire + schéma métier ». Raison: 15 des 17 modèles n'existent que pour valider
 * une soumission de formulaire — les deux exceptions (`modelMemberCondition`, `modelImportOptions`)
 * parsent un corps JSON dans un `+server.ts` et restent inchangées. Dédoubler reviendrait à tenir
 * deux fois les mêmes règles métier (longueurs minimales, email, url) pour qu'elles divergent.
 *
 * La contrainte de `form()` porte sur l'**entrée** du schéma, qui doit être un `RemoteFormInput`:
 * chaîne, nombre, booléen, `File`, ou objet/tableau de ceux-ci — jamais `null`, jamais `unknown`.
 * La **sortie** reste libre: les `transform` vers les formes Prisma sont conservés tels quels,
 * donc les gestionnaires ne changent pas.
 *
 * Les conversions à faire, une fois pour toutes:
 *
 * | avant (`parseFormData`)  | après (`form()`)                  | pourquoi                                        |
 * | ------------------------ | --------------------------------- | ----------------------------------------------- |
 * | `z.boolean()`            | `z.boolean().default(false)`       | une case décochée n'envoie rien                 |
 * | `z.string().nullish()`   | `z.string().optional()`            | `null` n'est pas un `RemoteFormInput`            |
 * | `z.date()`               | `zDate` (`$lib/models/form`)       | un `<input type="date">` envoie une chaîne       |
 * | `z.relation.connect`     | `zConnect`                         | un champ envoie l'id, pas `{ id }`               |
 * | `z.relations.set`        | `zSet` / `zConnectMany`            | idem, en `name="x[]"`                            |
 * | `z.number()`             | inchangé                           | `field.as('number')` préfixe le `name` de `n:`   |
 *
 * `z.coerce.number()` ne passe pas: son entrée est `unknown`. Pour un champ brut (hors composant
 * `Input*` de fuma), écrire `z.string().transform(Number)`.
 */
export * from './user'
export * from './event'
export * from './team'
export * from './period'
export * from './subscribe'
export * from './page'
export * from './memberField'
export * from './gift'
export * from './checkout'
export * from './view'
export * from './invite'
export * from './member'
export * from './tag'
export * from './milestone'
export * from './badge'
