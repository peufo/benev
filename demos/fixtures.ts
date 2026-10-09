import type { Page } from '@playwright/test'
import { prisma, signIn, type SeededUser } from '../tests/seed'
import { mockPhoton } from '../tests/photon'
import { gotoHydrated } from '../tests/hydrated'
import { TERMS_VERSION } from '../src/lib/constant/terms'
import cuid from '@paralleldrive/cuid2'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/**
 * Les données des démos: des noms crédibles et des avatars, là où les tests se contentent de
 * « Bob The Tester ». Chaque démo repart d'un compte neuf: supprimer l'ancien emporte ses
 * évènements, et l'URL de l'évènement reste donc la même d'une prise à l'autre.
 */

const avatar = (seed: string) =>
	`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`

export async function seedOrganizer(page: Page): Promise<SeededUser> {
	const email = 'camille.rochat@benevio.test'
	await prisma.user.deleteMany({ where: { email } })
	const user = await prisma.user.create({
		data: {
			id: cuid.createId(),
			email,
			firstName: 'Camille',
			lastName: 'Rochat',
			isOrganizer: true,
			isEmailVerified: true,
			isTermsAccepted: true,
			termsVersion: TERMS_VERSION,
			termsAcceptedAt: new Date(),
			avatarPlaceholder: avatar('camille'),
		},
		select: { id: true, email: true, firstName: true, lastName: true },
	})
	await signIn(page, user)
	return user
}

/** L'évènement se crée par l'interface (voir `tests/seed.ts`), hors champ. */
export async function createEvent(page: Page, name = 'Festival des Lumières') {
	await mockPhoton(page)
	await gotoHydrated(page, '/me/events/create')
	await page.getByLabel("Nom de l'évènement").fill(name)
	await page.getByRole('button', { name: 'Créer mon évènement' }).click()
	await page.waitForURL('**/admin/dashboard')
	const eventId = new URL(page.url()).pathname.split('/')[1]
	return { eventId, name }
}

/** Un tirage reproductible: chaque prise montre les mêmes inscriptions. */
function random(seed = 42) {
	let s = seed
	return () => {
		s = (s * 1664525 + 1013904223) % 4294967296
		return s / 4294967296
	}
}

const VOLUNTEERS = [
	'Léa Morel',
	'Hugo Favre',
	'Chloé Bonvin',
	'Lucas Perrin',
	'Manon Gay',
	'Nathan Rey',
	'Inès Dubois',
	'Théo Rossier',
	'Jade Monnet',
	'Louis Berset',
	'Zoé Clerc',
	'Gabriel Roch',
	'Emma Jaquet',
	'Arthur Pittet',
	'Lina Cuénod',
	'Jules Bovet',
	'Alice Cooper',
	'Noah Vuille',
	'Sarah Golay',
	'Adam Chappuis',
	'Louise Duc',
	'Raphaël Bader',
	'Anna Frei',
	'Samuel Pasche',
	'Mia Schmid',
	'Elias Ducret',
	'Julia Meylan',
	'Liam Girard',
	'Nina Burri',
	'Tom Udriot',
	'Eva Rochat',
	'Maël Fivaz',
	'Lou Marti',
	'Victor Aebi',
	'Rose Jordan',
	'Malo Simonet',
	'Clara Nicolet',
	'Axel Brun',
	'Elsa Kohler',
	'Robin Mottier',
	'Margaux Ruffieux',
	'Simon Gex',
	'Agathe Python',
	'Paul Lambiel',
	'Yasmine Haddad',
	'Diego Ferreira',
	'Fatou Diallo',
	'Mehdi Benali',
	'Aurélie Crettenand',
	'Kevin Sauthier',
	'Laura Pellet',
	'Bastien Oguey',
	'Océane Wicht',
	'Olivier Moret',
	'Marion Delay',
	'Yann Tissot',
]

/** Six secteurs sur un week-end: `day` 0 = vendredi. */
const TEAMS = [
	{
		name: 'Montage',
		description: 'Monter les scènes, les stands et la signalétique avant l’ouverture.',
		periods: [
			[0, 8, 12, 6],
			[0, 13, 18, 6],
		],
	},
	{
		name: 'Accueil & billetterie',
		description:
			'Accueillir le public, scanner les billets et poser les bracelets avec le sourire.',
		periods: [
			[0, 16, 20, 4],
			[1, 14, 18, 4],
			[1, 18, 22, 4],
		],
	},
	{
		name: 'Bar principal',
		description: 'Servir boissons et sourires au cœur du festival.',
		periods: [
			[0, 17, 21, 5],
			[0, 21, 25, 5],
			[1, 17, 21, 5],
			[1, 21, 25, 5],
		],
	},
	{
		name: 'Cuisine',
		description: 'Préparer les repas des bénévoles et des artistes.',
		periods: [
			[0, 11, 15, 4],
			[0, 17, 22, 4],
			[1, 11, 15, 4],
			[1, 17, 22, 4],
		],
	},
	{
		name: 'Éco-team',
		description: 'Garder le site propre, gérer le tri et sensibiliser le public.',
		periods: [
			[1, 12, 16, 3],
			[1, 16, 20, 3],
		],
	},
	{
		name: 'Démontage',
		description: 'Tout ranger pour rendre le site plus beau qu’on ne l’a trouvé.',
		periods: [[2, 9, 13, 6]],
	},
] as const

/** Le vendredi du festival: dans trois semaines au moins, pour que tout reste à venir. */
export function festivalFriday() {
	const d = new Date()
	d.setDate(d.getDate() + 21 + ((5 - d.getDay() + 7) % 7))
	d.setHours(0, 0, 0, 0)
	return d
}

const LOGO = fileURLToPath(new URL('./assets/logo-festival.png', import.meta.url))

/**
 * L'identité que pose la démo `create-space`: le logo et le thème Crépuscule. Le média est
 * écrit là où `$lib/server/media` l'aurait écrit, sous `MEDIA_DIR` (celui du `.env`).
 */
async function seedIdentity(eventId: string, createdById: string) {
	const logo = await prisma.media.create({
		data: { eventId, name: 'Logo du festival', createdById },
	})
	const dir = path.resolve(process.env.MEDIA_DIR ?? './media', logo.id)
	await mkdir(dir, { recursive: true })
	await sharp(LOGO).toFile(path.resolve(dir, 'original.webp'))
	// Les réglages de `THEME_PRESETS.crepuscule`, que `$lib/constant` ne laisse pas importer hors
	// de SvelteKit (il lit `$app/env/public`).
	await prisma.event.update({
		where: { id: eventId },
		data: {
			logoId: logo.id,
			backgroundPreset: 'crepuscule',
			backgroundBlur: 0,
			backgroundBrightness: 100,
			backgroundWhiteness: 0,
			backgroundGrain: 0.4,
		},
	})
}

type FestivalOptions = {
	/** Les secteurs, publiés. */
	teams?: boolean
	/** Leurs créneaux. */
	periods?: boolean
	/** Les bénévoles, leurs profils et leurs inscriptions. */
	volunteers?: boolean
	/** Les champs de profil « Régime alimentaire » et « Taille de t-shirt ». */
	fields?: boolean
	/** Les secteurs laissés sans créneau, que la démo va planifier. */
	unplanned?: string[]
}

/**
 * L'organisatrice, son évènement créé par l'interface, puis ce que la démo demande de semer.
 * L'évènement passe en premium (les bénévoles dépassent le quota de base) et publié.
 */
export async function seedFestival(
	page: Page,
	{
		teams = true,
		periods = true,
		volunteers = true,
		fields = volunteers,
		unplanned = [],
	}: FestivalOptions = {}
) {
	const organizer = await seedOrganizer(page)
	const { eventId, name } = await createEvent(page)
	const friday = festivalFriday()
	const at = (day: number, hour: number) =>
		new Date(friday.getTime() + (day * 24 + hour) * 60 * 60 * 1000)
	await prisma.event.update({
		where: { id: eventId },
		data: { tier: 'premium', state: 'published', startDate: at(0, 8), endDate: at(2, 13) },
	})
	await seedIdentity(eventId, organizer.id)
	const rand = random()

	const fieldIds: { diet?: string; size?: string } = {}
	if (fields) {
		const diet = await prisma.field.create({
			data: {
				eventId,
				name: 'Régime alimentaire',
				type: 'multiselect',
				options: JSON.stringify(['Végétarien', 'Végane', 'Sans gluten']),
				memberCanRead: true,
				memberCanWrite: true,
				position: 0,
			},
		})
		const size = await prisma.field.create({
			data: {
				eventId,
				name: 'Taille de t-shirt',
				type: 'select',
				options: JSON.stringify(['S', 'M', 'L', 'XL']),
				memberCanRead: true,
				memberCanWrite: true,
				required: true,
				position: 1,
			},
		})
		fieldIds.diet = diet.id
		fieldIds.size = size.id
	}

	const members = []
	if (volunteers) {
		for (const fullName of VOLUNTEERS) {
			const [firstName, ...last] = fullName.split(' ')
			const lastName = last.join(' ')
			const slug = fullName
				.normalize('NFD')
				.replace(/[̀-ͯ]/g, '')
				.toLowerCase()
				.replace(/[^a-z]+/g, '.')
			const profileJson: PrismaJson.MemberProfile = {}
			if (fieldIds.diet) {
				const r = rand()
				profileJson[fieldIds.diet] =
					r < 0.25 ? ['Végétarien'] : r < 0.32 ? ['Végane'] : r < 0.38 ? ['Sans gluten'] : []
			}
			if (fieldIds.size) profileJson[fieldIds.size] = ['S', 'M', 'L', 'XL'][Math.floor(rand() * 4)]
			const email = `${slug}@benevio.test`
			// Un vrai compte derrière chaque fiche: sans lui, elle se lirait comme une invitation.
			const user = await prisma.user.upsert({
				where: { email },
				update: {},
				create: {
					id: cuid.createId(),
					email,
					firstName,
					lastName,
					isEmailVerified: true,
					isTermsAccepted: true,
					termsVersion: TERMS_VERSION,
					termsAcceptedAt: new Date(),
					avatarPlaceholder: avatar(fullName),
				},
			})
			members.push(
				await prisma.member.create({
					data: {
						eventId,
						userId: user.id,
						firstName,
						lastName,
						email,
						phone: `079 ${100 + Math.floor(rand() * 900)} ${10 + Math.floor(rand() * 90)} ${10 + Math.floor(rand() * 90)}`,
						isEmailVerified: true,
						isValidedByEvent: true,
						avatarPlaceholder: avatar(fullName),
						profileJson,
						isNotifiedSubscribe: false,
						isNotifiedLeaderOfSubscribe: false,
						isNotifiedAdminOfNewMember: false,
						createdAt: new Date(Date.now() - rand() * 30 * 24 * 60 * 60 * 1000),
					},
				})
			)
		}
	}

	const seededTeams = []
	if (teams) {
		for (const [position, team] of TEAMS.entries()) {
			const leader = members.length ? members[(position * 7) % members.length] : undefined
			const created = await prisma.team.create({
				data: {
					eventId,
					name: team.name,
					description: team.description,
					state: 'published',
					position,
					leaders: leader ? { connect: { id: leader.id } } : undefined,
				},
			})
			const createdPeriods = []
			if (periods && !unplanned.includes(team.name)) {
				for (const [day, from, to, maxSubscribe] of team.periods) {
					const period = await prisma.period.create({
						data: { teamId: created.id, start: at(day, from), end: at(day, to), maxSubscribe },
					})
					createdPeriods.push(period)
					if (!members.length) continue
					// Remplissage de 30 % à 110 % de la jauge: des créneaux complets, d'autres à pourvoir.
					const count = Math.round(maxSubscribe * (0.3 + rand() * 0.8))
					const taken = new Set<number>()
					while (taken.size < count) taken.add(Math.floor(rand() * members.length))
					for (const index of taken)
						await prisma.subscribe.create({
							data: {
								periodId: period.id,
								memberId: members[index].id,
								state: rand() < 0.82 ? 'accepted' : 'request',
							},
						})
				}
			}
			seededTeams.push({ ...created, periods: createdPeriods })
		}
	}

	return { organizer, eventId, name, teams: seededTeams, members, fieldIds, at }
}
