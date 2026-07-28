// `Intl.DurationFormat` (proposition TC39, stage 3) n'est pas encore déclaré dans les
// lib.*.d.ts de TypeScript 5.9. Déclaration volontairement minimale: elle couvre notre
// usage (formatDuration dans PeriodForm), pas toute la surface de l'API — les options
// par unité (`hours: 'numeric'`, `daysDisplay`, …) restent à ajouter si besoin.
// À supprimer dès que TypeScript embarquera le type.
//
// ATTENTION runtime: l'API n'est pas disponible partout. Bun l'a (vérifié en 1.2.22),
// Node ne l'a pas avant la v23 (`typeof Intl.DurationFormat === 'undefined'` en 22.x).
// Le Dockerfile lance l'app avec Bun, donc le SSR passe; sur un hôte Node l'appel
// lèverait un TypeError. Déclarer le type ne le rend pas disponible à l'exécution.
declare global {
	namespace Intl {
		type DurationFormatUnit =
			| 'years'
			| 'months'
			| 'weeks'
			| 'days'
			| 'hours'
			| 'minutes'
			| 'seconds'
			| 'milliseconds'
			| 'microseconds'
			| 'nanoseconds'

		type DurationInput = Partial<Record<DurationFormatUnit, number>>

		interface DurationFormatOptions {
			localeMatcher?: 'best fit' | 'lookup'
			numberingSystem?: string
			style?: 'long' | 'short' | 'narrow' | 'digital'
			fractionalDigits?: number
		}

		interface DurationFormat {
			format(duration: DurationInput): string
			formatToParts(duration: DurationInput): { type: string; value: string; unit?: string }[]
			resolvedOptions(): DurationFormatOptions & { locale: string }
		}

		const DurationFormat: {
			new (locales?: string | string[], options?: DurationFormatOptions): DurationFormat
			supportedLocalesOf(
				locales: string | string[],
				options?: Pick<DurationFormatOptions, 'localeMatcher'>
			): string[]
		}
	}
}

export {}
