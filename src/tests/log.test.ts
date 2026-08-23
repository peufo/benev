import { describe, it } from 'vitest'
import { LogType, type SubscribeState } from '@prisma/client'
import { logMap } from '$lib/log/logMap'
import { diffChanges, hasChanges, iso } from '$lib/log/logTypes'
import { projectEvent, projectMemberContact, projectTeam } from '$lib/log/logProject'

const actor = { userId: 'usr_1', firstName: 'Jean', lastName: 'Rey' }

/**
 * `satisfies { [T in LogType]: … }` garantit déjà l'exhaustivité à la compilation, et
 * `Log.svelte` fait de même pour le rendu. Ce test en est le double à l'exécution: quand l'enum
 * bouge, il nomme le type manquant, là où l'erreur de `svelte-check` sur un type mappé de vingt
 * clés ne se lit pas.
 */
describe('logMap', () => {
	it('a une transformation par valeur de LogType', ({ expect }) => {
		expect(Object.keys(logMap).sort()).toEqual(Object.values(LogType).sort())
	})

	it('dérive les relations depuis ce que la mutation a écrit', ({ expect }) => {
		const subscribe = {
			state: 'accepted' as SubscribeState,
			createdBy: 'user' as const,
			isForcedValidation: false,
			isAbsent: false,
			memberId: 'mbr_1',
			member: { id: 'mbr_1', firstName: 'Marc', lastName: 'Dupont' },
			period: {
				start: new Date('2026-07-04T08:00:00Z'),
				end: new Date('2026-07-04T12:00:00Z'),
				maxSubscribe: 3,
				teamId: 'tm_1',
				team: { id: 'tm_1', name: 'Buvette', eventId: 'fete' },
			},
		}

		const log = logMap.subscribe_state({ subscribe, before: 'request', actor })

		// Aucun point d'appel n'a eu à remonter `period.team.eventId` lui-même.
		expect(log.eventId).toBe('fete')
		expect(log.memberId).toBe('mbr_1')
		expect(log.teamId).toBe('tm_1')
		expect(log.createdById).toBe('usr_1')
	})

	it('fige les noms dans data plutôt que de compter sur une jointure', ({ expect }) => {
		const member = { id: 'mbr_1', eventId: 'fete', firstName: 'Marc', lastName: 'Dupont' }
		const log = logMap.member_delete({ member, actor, isSelf: false })

		// La ligne est écrite après la suppression: il n'y a plus de membre à pointer, seul le
		// nom conservé dit qui est parti. Le type l'interdit déjà — reste à vérifier qu'aucune
		// clé ne se glisse à l'exécution, car `createLog` la reprendrait telle quelle.
		expect('memberId' in log).toBe(false)
		expect(log.data.member).toEqual({ id: 'mbr_1', name: 'Marc Dupont' })
		expect(log.data.actor).toEqual({ id: 'usr_1', name: 'Jean Rey' })
	})

	it('rend les dates en chaîne, comme la colonne JSON les restituera', ({ expect }) => {
		const log = logMap.period_create({
			period: {
				start: new Date('2026-07-04T08:00:00Z'),
				end: new Date('2026-07-04T12:00:00Z'),
				maxSubscribe: 2,
			},
			team: { id: 'tm_1', name: 'Buvette', eventId: 'fete' },
			actor,
		})
		expect(log.data.period.start).toBe('2026-07-04T08:00:00.000Z')
		expect(typeof log.data.period.end).toBe('string')
	})

	it('transmet tel quel le contexte capturé à la mise en file des emails', ({ expect }) => {
		const log = logMap.email_failed({
			relations: { eventId: 'fete', memberId: 'mbr_1' },
			subject: 'Invitation',
			to: ['marc@example.org'],
			error: '550 Mailbox unavailable',
			attempts: 1,
			reason: 'permanent',
		})
		// Le worker draine hors requête: rien à dériver, tout vient de l'appelant.
		expect(log.eventId).toBe('fete')
		expect(log.memberId).toBe('mbr_1')
		expect(log.data.reason).toBe('permanent')
	})
})

/**
 * La projection tient lieu de liste blanche: c'est elle qui décide de ce que le journal conserve.
 * Un champ qui s'y glisserait par accident deviendrait une rétention de données personnelles que
 * la suppression du compte ne nettoierait pas.
 */
describe('projections', () => {
	it('ne retient du membre que ses coordonnées', ({ expect }) => {
		const snapshot = projectMemberContact({
			firstName: 'Marc',
			lastName: 'Dupont',
			email: 'marc@example.org',
			phone: null,
			birthday: new Date('1990-05-02T00:00:00Z'),
			street: null,
			zipCode: null,
			city: 'Lausanne',
		})
		expect(Object.keys(snapshot).sort()).toEqual([
			'birthday',
			'city',
			'email',
			'firstName',
			'lastName',
			'phone',
			'street',
			'zipCode',
		])
		expect(snapshot.birthday).toBe('1990-05-02T00:00:00.000Z')
	})

	it("laisse le thème de l'évènement hors du journal", ({ expect }) => {
		const keys = Object.keys(projectEvent(anEvent()))
		for (const themeKey of [
			'backgroundColor',
			'backgroundImageId',
			'backgroundPreset',
			'backgroundBlur',
			'backgroundGrain',
			'posterId',
			'logoId',
		]) {
			expect(keys).not.toContain(themeKey)
		}
	})

	it('réduit le lieu à son libellé', ({ expect }) => {
		const snapshot = projectEvent(
			anEvent({ location: { label: 'Nyon', coords: { lat: 1, lon: 2 } } })
		)
		expect(snapshot.location).toBe('Nyon')
	})

	it('rend les responsables par leurs noms, pas par leurs ids', ({ expect }) => {
		const snapshot = projectTeam({
			name: 'Buvette',
			description: null,
			closeSubscribing: null,
			overflowPermitted: false,
			leaders: [{ firstName: 'Jean', lastName: 'Rey' }],
		})
		expect(snapshot.leaders).toEqual(['Jean Rey'])
	})
})

describe('diffChanges', () => {
	it('ne garde que les clés qui ont bougé', ({ expect }) => {
		const before = { name: 'Fête', description: 'Ancienne', phone: null }
		const after = { name: 'Fête', description: 'Nouvelle', phone: null }
		const changes = diffChanges(before, after)
		expect(Object.keys(changes.after)).toEqual(['description'])
		expect(changes.before.description).toBe('Ancienne')
	})

	// Un champ texte vidé revient en `''` là où la base tenait `null`: les opposer produirait une
	// ligne de journal à chaque enregistrement, sans que rien n'ait changé.
	it("n'oppose pas la chaîne vide à null", ({ expect }) => {
		expect(hasChanges(diffChanges({ phone: null }, { phone: '' }))).toBe(false)
	})

	it('compare les tableaux par leur contenu', ({ expect }) => {
		expect(hasChanges(diffChanges({ leaders: ['a'] }, { leaders: ['a'] }))).toBe(false)
		expect(hasChanges(diffChanges({ leaders: ['a'] }, { leaders: ['a', 'b'] }))).toBe(true)
	})

	it('rend un diff vide quand la soumission ne change rien', ({ expect }) => {
		const snapshot = projectEvent(anEvent())
		expect(hasChanges(diffChanges(snapshot, snapshot))).toBe(false)
	})
})

describe('iso', () => {
	it('normalise en chaîne ISO et laisse passer le vide', ({ expect }) => {
		expect(iso(new Date('2026-07-04T08:00:00Z'))).toBe('2026-07-04T08:00:00.000Z')
		expect(iso('2026-07-04T08:00:00.000Z')).toBe('2026-07-04T08:00:00.000Z')
		expect(iso(null)).toBe(null)
		expect(iso(undefined)).toBe(null)
	})
})

function anEvent(overrides: Partial<Parameters<typeof projectEvent>[0]> = {}) {
	return {
		id: 'fete',
		name: 'Fête du village',
		description: null,
		email: null,
		phone: null,
		web: null,
		facebook: null,
		instagram: null,
		timezone: 'Europe/Zurich',
		location: null,
		selfRegisterAllowed: true,
		selfSubscribeAllowed: true,
		selfSubscribeCancelAllowed: false,
		closeSubscribing: null,
		overlapPeriodAllowed: 0,
		userEmailVerifiedRequired: false,
		userAddressRequired: false,
		userPhoneRequired: false,
		userBirthdayRequired: false,
		userAvatarRequired: false,
		...overrides,
	}
}
