import { Prisma } from '@prisma/client'

/**
 * Prisma refuse `null` sur une colonne Json nullable et exige `Prisma.DbNull`.
 * La conversion vit ici et non dans $lib/models, qui est importé par des
 * composants Svelte (validation live) et ne doit donc rien embarquer de Prisma.
 * `undefined` est laissé tel quel: Prisma ignore alors le champ.
 */
export const jsonOrDbNull = <T>(value: T | null | undefined) =>
	value === null ? Prisma.DbNull : value
