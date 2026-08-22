import type { EventState, LogType, SubscribeCreatedBy, SubscribeState } from '@prisma/client'
import {
	refActor,
	refPerson,
	type LogActor,
	type LogOutput,
	type LogRef,
	type LogUpdate,
	type LogWithEvent,
} from './logTypes'
import {
	projectPeriod,
	type EventSnapshot,
	type LogPeriod,
	type MemberContactSnapshot,
	type TeamSnapshot,
} from './logProject'

/**
 * Une transformation par type de journal. Chacune prend ce que la mutation vient d'écrire et en
 * dérive à la fois les colonnes de relation et la charge utile — le point d'appel n'a jamais à
 * remonter un `eventId` à travers ses jointures.
 *
 * Les noms affichés sont figés dans `data`: le fil se rend sans une seule jointure et reste vrai
 * après la disparition de ce qu'il cite. Les relations ne servent qu'au filtrage et aux liens.
 *
 * `satisfies` rend la table exhaustive sur `LogType`: une valeur ajoutée à l'enum ne compile pas
 * tant qu'elle n'a pas sa transformation, et `Log.svelte` impose la même chose au rendu.
 */
export const logMap = {
	subscribe_create: ({ subscribe, actor }: { subscribe: SubscribeSource; actor: LogActor }) => ({
		...subscribeRelations(subscribe),
		createdById: actor.userId,
		data: {
			state: subscribe.state,
			createdBy: subscribe.createdBy,
			isForced: subscribe.isForcedValidation,
			...subscribeRefs(subscribe),
			actor: refActor(actor),
		},
	}),

	subscribe_state: ({
		subscribe,
		before,
		actor,
	}: {
		subscribe: SubscribeSource
		before: SubscribeState
		actor: LogActor
	}) => ({
		...subscribeRelations(subscribe),
		createdById: actor.userId,
		data: {
			before,
			after: subscribe.state,
			isForced: subscribe.isForcedValidation,
			...subscribeRefs(subscribe),
			actor: refActor(actor),
		},
	}),

	subscribe_delete: ({ subscribe, actor }: { subscribe: SubscribeSource; actor: LogActor }) => ({
		...subscribeRelations(subscribe),
		createdById: actor.userId,
		data: {
			state: subscribe.state,
			...subscribeRefs(subscribe),
			actor: refActor(actor),
		},
	}),

	subscribe_absent: ({ subscribe, actor }: { subscribe: SubscribeSource; actor: LogActor }) => ({
		...subscribeRelations(subscribe),
		createdById: actor.userId,
		data: {
			isAbsent: subscribe.isAbsent,
			...subscribeRefs(subscribe),
			actor: refActor(actor),
		},
	}),

	member_invite: ({
		member,
		actor,
		sendEmail,
	}: {
		member: MemberSource
		actor: LogActor
		sendEmail: boolean
	}) => ({
		eventId: member.eventId,
		memberId: member.id,
		createdById: actor.userId,
		data: {
			member: refPerson(member),
			email: member.email ?? null,
			// Première réponse à « l'invitation n'est jamais arrivée »: peut-être n'a-t-elle
			// jamais été demandée.
			sendEmail,
			actor: refActor(actor),
		},
	}),

	/** L'acteur est celui qui rejoint: personne d'autre ne peut accepter à sa place. */
	member_join: ({
		member,
		actor,
		wasInvited,
	}: {
		member: MemberSource
		actor: LogActor
		wasInvited: boolean
	}) => ({
		eventId: member.eventId,
		memberId: member.id,
		userId: actor.userId,
		createdById: actor.userId,
		data: {
			member: refPerson(member),
			wasInvited,
			isValidedByEvent: member.isValidedByEvent,
			actor: refActor(actor),
		},
	}),

	/**
	 * `memberId` reste nul: la ligne est écrite après la suppression, il n'y a plus de clé à
	 * pointer. C'est le nom figé dans `data` qui garde la trace de qui est parti.
	 */
	member_delete: ({
		member,
		actor,
		isSelf,
	}: {
		member: MemberSource
		actor: LogActor
		isSelf: boolean
	}) => ({
		eventId: member.eventId,
		createdById: actor.userId,
		data: {
			member: refPerson(member),
			isSelf,
			actor: refActor(actor),
		},
	}),

	/**
	 * Les champs de profil sont libres par évènement et peuvent porter n'importe quoi (régime,
	 * santé): seuls leurs **noms** sont journalisés, jamais leurs valeurs. Les coordonnées, elles,
	 * sont le sujet même de la modification et se lisent en diff.
	 */
	member_update: ({
		member,
		actor,
		contact,
		fields,
	}: {
		member: MemberSource
		actor: LogActor
		contact?: LogUpdate<MemberContactSnapshot>
		fields?: string[]
	}) => ({
		eventId: member.eventId,
		memberId: member.id,
		createdById: actor.userId,
		data: {
			member: refPerson(member),
			actor: refActor(actor),
			contact,
			fields,
		},
	}),

	member_role: ({
		member,
		actor,
		isAdmin,
		leaderOf,
	}: {
		member: MemberSource
		actor: LogActor
		isAdmin?: LogUpdate<{ isAdmin: boolean }>
		leaderOf?: { before: string[]; after: string[] }
	}) => ({
		eventId: member.eventId,
		memberId: member.id,
		createdById: actor.userId,
		data: {
			member: refPerson(member),
			actor: refActor(actor),
			isAdmin,
			leaderOf,
		},
	}),

	member_validated: ({
		member,
		actor,
		isValidedByEvent,
	}: {
		member: MemberSource
		actor: LogActor
		isValidedByEvent: boolean
	}) => ({
		eventId: member.eventId,
		memberId: member.id,
		createdById: actor.userId,
		data: {
			member: refPerson(member),
			isValidedByEvent,
			actor: refActor(actor),
		},
	}),

	event_state: ({
		event,
		before,
		actor,
	}: {
		event: { id: string; name: string; state: EventState }
		before: EventState
		actor: LogActor
	}) => ({
		eventId: event.id,
		createdById: actor.userId,
		data: {
			event: { id: event.id, name: event.name },
			before,
			after: event.state,
			actor: refActor(actor),
		},
	}),

	event_update: ({
		event,
		changes,
		actor,
	}: {
		event: { id: string; name: string }
		changes: LogUpdate<EventSnapshot>
		actor: LogActor
	}) => ({
		eventId: event.id,
		createdById: actor.userId,
		data: {
			event: { id: event.id, name: event.name },
			changes,
			actor: refActor(actor),
		},
	}),

	team_create: ({ team, actor }: { team: TeamSource; actor: LogActor }) => ({
		eventId: team.eventId,
		teamId: team.id,
		createdById: actor.userId,
		data: { team: teamRef(team), actor: refActor(actor) },
	}),

	team_update: ({
		team,
		changes,
		actor,
	}: {
		team: TeamSource
		changes: LogUpdate<TeamSnapshot>
		actor: LogActor
	}) => ({
		eventId: team.eventId,
		teamId: team.id,
		createdById: actor.userId,
		data: { team: teamRef(team), changes, actor: refActor(actor) },
	}),

	/** `teamId` reste nul: le secteur n'existe plus, son nom est figé dans `data`. */
	team_delete: ({ team, actor }: { team: TeamSource; actor: LogActor }) => ({
		eventId: team.eventId,
		createdById: actor.userId,
		data: { team: teamRef(team), actor: refActor(actor) },
	}),

	period_create: ({ period, team, actor }: PeriodInput) => ({
		eventId: team.eventId,
		teamId: team.id,
		createdById: actor.userId,
		data: { team: teamRef(team), period: projectPeriod(period), actor: refActor(actor) },
	}),

	period_delete: ({ period, team, actor }: PeriodInput) => ({
		eventId: team.eventId,
		teamId: team.id,
		createdById: actor.userId,
		data: { team: teamRef(team), period: projectPeriod(period), actor: refActor(actor) },
	}),

	/** La seule ligne écrite à la main. `member` absent: note posée sur le fil de l'évènement. */
	note_create: ({
		eventId,
		member,
		message,
		actor,
	}: {
		eventId: string
		member?: MemberSource | null
		message: string
		actor: LogActor
	}) => ({
		eventId,
		memberId: member?.id ?? null,
		createdById: actor.userId,
		data: {
			message,
			member: member ? refPerson(member) : null,
			actor: refActor(actor),
		},
	}),

	/**
	 * Les deux types d'email sont écrits par le worker, qui draine **hors requête**: il n'y a pas
	 * de `getRequestEvent()` à interroger, donc pas de relation à dériver. Le contexte est celui
	 * capturé à la mise en file, transmis tel quel.
	 */
	email_sent: ({
		relations,
		subject,
		to,
		messageId,
		response,
		rejected,
	}: {
		relations: EmailRelations
		subject: string
		to: string[]
		messageId: string
		response: string
		rejected: string[] | undefined
	}) => ({
		...relations,
		data: { subject, to, messageId, response, rejected },
	}),

	email_failed: ({
		relations,
		subject,
		to,
		error,
		attempts,
		reason,
	}: {
		relations: EmailRelations
		subject: string
		to: string[]
		error: string
		attempts: number
		reason: EmailFailureReason
	}) => ({
		...relations,
		data: { subject, to, error, attempts, reason },
	}),
	// `(input: never)` accepte n'importe quelle fonction à un argument par contravariance des
	// paramètres — et laisse `Parameters<>` retrouver le vrai type plus bas. Pas d'`any` en jeu.
} satisfies { [T in LogType]: (input: never) => LogOutput<unknown> }

/**
 * Une ligne dont la colonne `type` est connue, donc dont `data` l'est aussi.
 *
 * Distribué sur `T`: sans cela, un composant qui couvre plusieurs types recevrait un `type` et un
 * `data` indépendants, et `log.type === '…'` ne dirait rien de la charge utile.
 */
export type LogTyped<T extends LogType> = T extends LogType
	? Omit<LogWithEvent, 'type' | 'data'> & { type: T; data: LogDataMap[T] }
	: never

/**
 * Les types de journal, à l'exécution. Dérivés de la table plutôt qu'importés de `@prisma/client`:
 * l'enum n'y existe qu'au prix d'un import runtime du client Prisma, qui n'a rien à faire dans le
 * navigateur. La table étant exhaustive, la liste est la même.
 */
export const LOG_TYPES = Object.keys(logMap) as LogType[]

export type LogInput<T extends LogType> = Parameters<(typeof logMap)[T]>[0]
export type LogData<T extends LogType> = ReturnType<(typeof logMap)[T]>['data']
export type LogDataMap = { [T in LogType]: LogData<T> }

/**
 * Motif de l'échec d'un envoi, tel que le worker le constate.
 * - `permanent`: le relais a répondu en 5xx, réessayer répéterait le même refus.
 * - `exhausted`: erreur passagère, mais toutes les tentatives ont été consommées.
 * - `shutdown`: le serveur s'est arrêté avant que la file soit vidée.
 * - `overflow`: la file avait atteint son plafond, le message a été refusé à l'entrée.
 */
export type EmailFailureReason = 'permanent' | 'exhausted' | 'shutdown' | 'overflow'

/** Le contexte que `sendEmail` capture dans la requête et confie au worker. */
export type EmailRelations = Pick<
	LogOutput<never>,
	'eventId' | 'memberId' | 'userId' | 'createdById'
>

type MemberSource = {
	id: string
	eventId: string
	firstName: string
	lastName: string
	email?: string | null
	isValidedByEvent?: boolean
}

type TeamSource = { id: string; name: string; eventId: string }

type SubscribeSource = {
	state: SubscribeState
	createdBy: SubscribeCreatedBy
	isForcedValidation: boolean
	isAbsent: boolean
	memberId: string
	member: { id: string; firstName: string; lastName: string }
	period: {
		start: Date | string
		end: Date | string
		maxSubscribe: number
		teamId: string
		team: { id: string; name: string; eventId: string }
	}
}

type PeriodInput = {
	period: { start: Date | string; end: Date | string; maxSubscribe: number }
	team: TeamSource
	actor: LogActor
}

function subscribeRelations(subscribe: SubscribeSource) {
	return {
		eventId: subscribe.period.team.eventId,
		memberId: subscribe.memberId,
		teamId: subscribe.period.teamId,
	}
}

function subscribeRefs(subscribe: SubscribeSource): {
	member: LogRef
	team: LogRef
	period: LogPeriod
} {
	return {
		member: refPerson(subscribe.member),
		team: teamRef(subscribe.period.team),
		period: projectPeriod(subscribe.period),
	}
}

function teamRef(team: TeamSource): LogRef {
	return { id: team.id, name: team.name }
}
