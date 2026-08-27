import { describe, it } from 'vitest'
import { render } from 'svelte/server'
import type { Component } from 'svelte'
import type { LogType, SubscribeState } from '@prisma/client'
import { logMap, type LogTyped } from '$lib/log/logMap'
import LogSubscribe from '$lib/log/LogSubscribe.svelte'
import LogMember from '$lib/log/LogMember.svelte'
import LogMemberUpdate from '$lib/log/LogMemberUpdate.svelte'
import LogMemberRole from '$lib/log/LogMemberRole.svelte'
import LogEvent from '$lib/log/LogEvent.svelte'
import LogTeam from '$lib/log/LogTeam.svelte'
import LogPeriod from '$lib/log/LogPeriod.svelte'
import LogEmail from '$lib/log/LogEmail.svelte'

/**
 * Le rendu de chaque famille, alimenté par la charge utile que produit vraiment `logMap`.
 *
 * `svelte-check` vérifie déjà les accès de propriétés; ce qu'il ne voit pas, c'est ce qui casse à
 * l'exécution — un `.join()` sur une clé absente, un libellé indexé par une valeur inconnue. Le
 * tour complet transformation -> composant est le seul à l'attraper.
 *
 * `Log.svelte` n'est pas monté ici: il importe `LogNote`, donc `log.remote.ts`, donc `$app/server`,
 * qui n'existe pas hors du serveur SvelteKit. Sa table de composants reste garantie par son type.
 */

const actor = { userId: 'usr_1', firstName: 'Jean', lastName: 'Rey' }
const member = { id: 'mbr_1', eventId: 'fete', firstName: 'Marc', lastName: 'Dupont' }
const team = { id: 'tm_1', name: 'Buvette', eventId: 'fete' }
const period = {
	start: new Date('2026-07-04T08:00:00Z'),
	end: new Date('2026-07-04T12:00:00Z'),
	maxSubscribe: 3,
}

function aSubscribe(state: SubscribeState, overrides: Record<string, unknown> = {}) {
	return {
		state,
		createdBy: 'user' as const,
		isForcedValidation: false,
		isAbsent: false,
		memberId: member.id,
		member,
		period: { ...period, teamId: team.id, team },
		...overrides,
	}
}

/** Enveloppe la charge utile dans la ligne telle que la page la transmet. */
function asLog<T extends LogType>(type: T, data: unknown): LogTyped<T> {
	return {
		id: 'log_1',
		type,
		data,
		eventId: 'fete',
		memberId: null,
		teamId: null,
		userId: null,
		createdById: actor.userId,
		createdAt: new Date('2026-07-01T10:00:00Z'),
		event: { id: 'fete', name: 'Fête du village' },
	} as LogTyped<T>
}

function renderLog<T extends LogType>(
	component: Component<{ log: LogTyped<T>; timezone?: string }>,
	type: T,
	data: unknown
): string {
	const { body } = render(component as Component<Record<string, unknown>>, {
		props: { log: asLog(type, data), timezone: 'Europe/Zurich' },
	})
	// Le compilateur coupe les lignes où bon lui semble: sans normalisation, « 3 places » se lit
	// « 3\n\t\tplaces » et aucune assertion de texte ne tient.
	return body.replace(/\s+/g, ' ')
}

describe('rendu du journal', () => {
	it('rend les quatre formes d’inscription', ({ expect }) => {
		const created = renderLog(
			LogSubscribe,
			'subscribe_create',
			logMap.subscribe_create({ subscribe: aSubscribe('request'), actor }).data
		)
		expect(created).toContain('Jean Rey')
		expect(created).toContain('Buvette')
		expect(created).toContain('En demande')

		const changed = renderLog(
			LogSubscribe,
			'subscribe_state',
			logMap.subscribe_state({
				subscribe: aSubscribe('accepted', { isForcedValidation: true }),
				before: 'request',
				actor,
			}).data
		)
		expect(changed).toContain('En demande')
		expect(changed).toContain('Acceptée')
		expect(changed).toContain('validation forcée')

		expect(
			renderLog(
				LogSubscribe,
				'subscribe_delete',
				logMap.subscribe_delete({ subscribe: aSubscribe('accepted'), actor }).data
			)
		).toContain('Marc Dupont')

		expect(
			renderLog(
				LogSubscribe,
				'subscribe_absent',
				logMap.subscribe_absent({ subscribe: aSubscribe('accepted', { isAbsent: true }), actor })
					.data
			)
		).toContain('absent')
	})

	it('rend les formes d’adhésion', ({ expect }) => {
		const invited = renderLog(
			LogMember,
			'member_invite',
			logMap.member_invite({
				member: { ...member, email: 'marc@example.org' },
				actor,
				sendEmail: false,
				// Les secteurs confiés à l'invitation: leurs noms sont figés, rien n'est joint.
				teams: [{ id: 'team_bar', name: 'Bar' }],
			}).data
		)
		expect(invited).toContain('marc@example.org')
		expect(invited).toContain('aucun email envoyé')
		expect(invited).toContain('a invité')
		expect(invited).toContain('Bar')

		// Le renvoi rejoue le même type: seul le drapeau le distingue du premier envoi.
		const resent = renderLog(
			LogMember,
			'member_invite',
			logMap.member_invite({
				member: { ...member, email: 'marc@example.org' },
				actor,
				sendEmail: true,
				resent: true,
			}).data
		)
		expect(resent).toContain('a renvoyé une invitation à')
		expect(resent).not.toContain('aucun email envoyé')
		expect(resent).not.toContain('responsable de')

		expect(
			renderLog(
				LogMember,
				'member_join',
				logMap.member_join({ member, actor, wasInvited: true }).data
			)
		).toContain("a accepté l'invitation")

		expect(
			renderLog(
				LogMember,
				'member_delete',
				logMap.member_delete({ member, actor, isSelf: true }).data
			)
		).toContain("a quitté l'évènement")

		expect(
			renderLog(
				LogMember,
				'member_validated',
				logMap.member_validated({ member, actor, isValidedByEvent: true }).data
			)
		).toContain('a approuvé')
	})

	it('rend un diff des coordonnées comme des champs de profil', ({ expect }) => {
		const html = renderLog(
			LogMemberUpdate,
			'member_update',
			logMap.member_update({
				member,
				actor,
				contact: { before: { city: 'Nyon' }, after: { city: 'Lausanne' } },
				// Les champs de profil sont indexés par leur nom: c'est lui qui fait le libellé.
				profile: {
					before: { 'Régime alimentaire': null, Tailles: ['S'] },
					after: { 'Régime alimentaire': 'Végétarien', Tailles: ['S', 'M'] },
				},
			}).data
		)
		expect(html).toContain('Localité')
		expect(html).toContain('Nyon')
		expect(html).toContain('Lausanne')
		expect(html).toContain('Régime alimentaire')
		expect(html).toContain('Végétarien')
		expect(html).toContain('S, M')
	})

	it('rend le passage administrateur', ({ expect }) => {
		const promu = renderLog(
			LogMemberRole,
			'member_role',
			logMap.member_role({
				member,
				actor,
				isAdmin: { before: { isAdmin: false }, after: { isAdmin: true } },
			}).data
		)
		expect(promu).toContain('Administrateur')

		const retire = renderLog(
			LogMemberRole,
			'member_role',
			logMap.member_role({
				member,
				actor,
				isAdmin: { before: { isAdmin: true }, after: { isAdmin: false } },
			}).data
		)
		expect(retire).toContain("N'est plus administrateur")
	})

	it("rend le statut et les réglages de l'évènement", ({ expect }) => {
		const event = { id: 'fete', name: 'Fête du village', state: 'published' as const }
		const created = renderLog(
			LogEvent,
			'event_create',
			logMap.event_create({ event, actor, clonedFrom: { id: 'fete-2025', name: 'Fête 2025' } }).data
		)
		expect(created).toContain("a créé l'évènement")
		expect(created).toContain('Fête 2025')

		expect(
			renderLog(LogEvent, 'event_state', logMap.event_state({ event, before: 'draft', actor }).data)
		).toContain('Publié')

		const updated = renderLog(
			LogEvent,
			'event_update',
			logMap.event_update({
				event,
				changes: {
					before: { selfSubscribeAllowed: true, closeSubscribing: null },
					after: { selfSubscribeAllowed: false, closeSubscribing: '2026-07-01T00:00:00.000Z' },
				},
				actor,
			}).data
		)
		expect(updated).toContain('Inscription libre')
		expect(updated).toContain('Clôture des inscriptions')
		expect(updated).toContain('01.07.2026')
	})

	it('rend les secteurs et les créneaux', ({ expect }) => {
		expect(renderLog(LogTeam, 'team_create', logMap.team_create({ team, actor }).data)).toContain(
			'a créé le secteur'
		)

		const updated = renderLog(
			LogTeam,
			'team_update',
			logMap.team_update({
				team,
				changes: { before: { leaders: [] }, after: { leaders: ['Zoe The Tester'] } },
				actor,
			}).data
		)
		expect(updated).toContain('Responsables')
		expect(updated).toContain('Zoe The Tester')

		const created = renderLog(
			LogPeriod,
			'period_create',
			logMap.period_create({ period, team, actor }).data
		)
		expect(created).toContain('Buvette')
		expect(created).toContain('3 places')
	})

	it('rend les deux issues d’un envoi', ({ expect }) => {
		const sent = renderLog(
			LogEmail,
			'email_sent',
			logMap.email_sent({
				relations: { eventId: 'fete' },
				subject: 'Invitation',
				to: ['marc@example.org', 'zoe@example.org'],
				messageId: '<abc@benev.io>',
				response: '250 Ok',
				rejected: ['zoe@example.org'],
			}).data
		)
		expect(sent).toContain('Email envoyé')
		expect(sent).toContain('zoe@example.org')

		const failed = renderLog(
			LogEmail,
			'email_failed',
			logMap.email_failed({
				relations: { eventId: 'fete' },
				subject: 'Invitation',
				to: ['marc@example.org'],
				error: '550 Mailbox unavailable',
				attempts: 1,
				reason: 'permanent',
			}).data
		)
		expect(failed).toContain('Refus définitif du relais')
		expect(failed).toContain('1 tentative')
	})
})
