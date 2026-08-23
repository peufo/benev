import { resolve } from '$app/paths'
import { page } from '$app/state'
import type { RouteId, RouteParams } from '$app/types'

/**
 * Les routes montées sous `/[eventId]`, indexées par leur chemin privé du préfixe et associées
 * aux paramètres qu'il reste à fournir une fois `eventId` injecté.
 */
type EventRoutes = {
	[K in RouteId as K extends `/[eventId]${infer P}` ? P : never]: Omit<RouteParams<K>, 'eventId'>
}
type EventRoute = keyof EventRoutes & string

/** Les routes qu'`eventId` suffit à résoudre — celles qui se passent sans second argument. */
export type EventRouteWithoutParams = {
	[K in EventRoute]: keyof EventRoutes[K] extends never ? K : never
}[EventRoute]

/** Un chemin d'évènement, éventuellement suivi d'une query ou d'un hash littéral. */
type EventPathArg = EventRoute | `${EventRoute}?${string}` | `${EventRoute}#${string}`

type WithoutSuffix<T extends string> = T extends `${infer P}?${string}`
	? P
	: T extends `${infer P}#${string}`
		? P
		: T

type Params<T extends EventPathArg> =
	WithoutSuffix<T> extends infer P extends EventRoute
		? keyof EventRoutes[P] extends never
			? []
			: [params: EventRoutes[P]]
		: never

const resolveRoute = resolve as (route: string, params: Record<string, string>) => string

/** `resolve()` pour l'évènement courant: le préfixe et l'`eventId` sont sous-entendus. */
export function eventPath<T extends EventPathArg>(...args: [path: T, ...Params<T>]): string {
	const { eventId } = page.params
	if (!eventId) throw new Error("eventPath() appelé hors d'une route /[eventId]")
	const params = args[1] as Record<string, string> | undefined
	return resolveRoute(`/[eventId]${args[0]}`, { eventId, ...params })
}
