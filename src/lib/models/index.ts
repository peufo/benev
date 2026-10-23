/**
 * ## Modèles zod et remote functions
 *
 * Ces modèles sont écrits **en place** pour être compatibles `form()`, plutôt que dédoublés
 * en « schéma formulaire + schéma métier »: la quasi-totalité n'existe que pour valider une
 * soumission de formulaire, et dédoubler reviendrait à tenir deux fois les mêmes règles métier
 * (longueurs minimales, email, url) pour qu'elles divergent.
 *
 * Chacun est un `z.object()` annoté `satisfies z.ZodType<Prisma.XInput>`, qui confronte la
 * **sortie** du schéma au type Prisma correspondant. Un `satisfies` sur la forme brute (l'objet
 * passé à `z.object()`) ne le permettrait pas: il ne sait pas décrire la sortie d'un `transform`,
 * or `zConnect`, `zDate` et `zJson` en sont. Se passer de l'annotation laisserait un champ mal
 * typé filer jusqu'à Prisma.
 *
 * La contrainte de `form()` porte sur l'**entrée** du schéma, qui doit être un `RemoteFormInput`:
 * chaîne, nombre, booléen, `File`, ou objet/tableau de ceux-ci, jamais `null` ni `unknown`.
 * La **sortie** reste libre: un `transform` y produit directement la forme Prisma.
 *
 * Ce qu'il faut écrire pour chaque sorte de champ:
 *
 * | champ              | schéma                                  | pourquoi                              |
 * | ------------------ | --------------------------------------- | ------------------------------------- |
 * | case à cocher      | `z.boolean().optional()` / `.default()` | voir ci-dessous                       |
 * | texte facultatif   | `z.string().optional()`                 | `null` n'est pas un `RemoteFormInput` |
 * | date               | `zDate` (`#lib/models/form`)            | le champ envoie une chaîne            |
 * | relation           | `zConnect`                              | le champ envoie l'id, pas `{ id }`    |
 * | liste de relations | `zSet` / `zConnectMany`                 | idem, en `name="x[]"`                 |
 * | nombre             | `z.number()`                            | `as('number')` préfixe de `n:`        |
 *
 * `z.coerce.number()` ne passe pas: son entrée est `unknown`. Pour un champ sans `field`, dont le
 * `name` est posé à la main, écrire `z.string().transform(Number)`.
 *
 * Les booléens suivent la garantie d'`InputBoolean`: une case rendue transmet toujours sa valeur,
 * `off` comprise. Une clé absente signifie donc « case non rendue », jamais « décochée »: d'où
 * `.optional()` pour un champ affiché conditionnellement, dont l'absence ne doit rien toucher. Les
 * autres prennent `.default(false)`: `form()` refuse un booléen ni optionnel ni muni d'un défaut.
 */
export * from './user'
export * from './event'
export * from './team'
export * from './period'
export * from './subscribe'
export * from './page'
export * from './memberField'
export * from './checkout'
export * from './view'
export * from './invite'
export * from './member'
export * from './tag'
export * from './milestone'
export * from './badge'
export * from './memberImport'
