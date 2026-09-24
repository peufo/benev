import { test, type Page } from '@playwright/test'
import cuid from '@paralleldrive/cuid2'
import { PrismaClient, type FieldType, type TeamState } from '@prisma/client'
import { TERMS_VERSION } from '../src/lib/constant/terms'

/**
 * Ce que les tests écrivent en base plutôt que de le cliquer. La création par l'interface reste
 * couverte, le parcours de `test.ts` la jouant pour chaque entité, mais la rejouer dans chaque
 * fichier ne prouvait rien de plus et coûtait le plus clair de la suite.
 *
 * Deux règles s'appliquent à tout ce qui est écrit ici:
 *
 * - Ce client n'est **pas** celui, étendu, de `$lib/server/prisma.ts`: la recopie des coordonnées
 *   du `User` sur ses `Member` et la synchronisation des dates de l'évènement sur ses créneaux
 *   n'ont pas lieu. Ce qui en dépend est posé à la main.
 * - L'évènement, lui, se crée toujours par l'interface (`useEvent().create`): c'est la seule entité
 *   à contenu dérivé (pages par défaut, modèles d'e-mail, thème), et la recopier ici dériverait le
 *   jour où `createEvent` change.
 */
export const prisma = new PrismaClient()

/** Un GIF transparent d'un pixel: aucune requête vers dicebear pendant la suite. */
const AVATAR_PLACEHOLDER =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export type SeededUser = {
	id: string
	email: string
	firstName: string
	lastName: string
}

/**
 * Un compte prêt à s'en servir: conditions acceptées à la version courante, sans quoi
 * `TermsAcceptDialog` s'ouvrirait par-dessus chaque page, et sans mot de passe, puisque
 * `signIn` ouvre la session directement. `useUser().register()` reste pour les tests qui
 * portent sur l'inscription elle-même.
 */
export async function seedUser(
	name: string,
	{ isEmailVerified = true, email: fixedEmail }: { isEmailVerified?: boolean; email?: string } = {}
): Promise<SeededUser> {
	// domaine .test (RFC 2606): jamais routable, aucun mail ne peut y arriver
	const email = fixedEmail ?? `${name.toLowerCase()}-${cuid.createId()}@benevio.test`
	const data = {
		email,
		firstName: name,
		lastName: 'The Tester',
		isOrganizer: true,
		isEmailVerified,
		isTermsAccepted: true,
		termsVersion: TERMS_VERSION,
		termsAcceptedAt: new Date(),
		avatarPlaceholder: AVATAR_PLACEHOLDER,
	}
	// `upsert`: une adresse fixe (celle de `ROOT_USER`) survit d'une exécution de la suite à la suivante.
	return prisma.user.upsert({
		where: { email },
		create: { id: cuid.createId(), ...data },
		update: data,
		select: { id: true, email: true, firstName: true, lastName: true },
	})
}

/**
 * Ouvre la session sans passer par le formulaire: une ligne `Session` et son cookie, tels que
 * lucia les écrit (`auth_session`, `secure` en env PROD, ce que `vite preview` est, et que
 * Chromium accepte malgré tout sur localhost).
 */
export async function signIn(page: Page, user: SeededUser) {
	const activeExpires = Date.now() + 1000 * 60 * 60 * 24
	const idleExpires = activeExpires + 1000 * 60 * 60 * 24 * 14
	const id = cuid.createId()
	await prisma.session.create({
		data: {
			id,
			user_id: user.id,
			active_expires: BigInt(activeExpires),
			idle_expires: BigInt(idleExpires),
		},
	})
	const baseURL = test.info().project.use.baseURL!
	await page.context().addCookies([
		{
			name: 'auth_session',
			value: id,
			url: baseURL,
			httpOnly: true,
			sameSite: 'Lax',
		},
	])
}

/** La fiche de `user` dans l'évènement, avec ses coordonnées recopiées comme le ferait le client étendu. */
export function seedMember(
	eventId: string,
	user: SeededUser,
	data: { isAdmin?: boolean; isValidedByEvent?: boolean; leaderOf?: string[] } = {}
) {
	const { leaderOf = [], ...rest } = data
	return prisma.member.create({
		data: {
			eventId,
			userId: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			isEmailVerified: true,
			avatarPlaceholder: AVATAR_PLACEHOLDER,
			isValidedByEvent: true,
			...rest,
			leaderOf: { connect: leaderOf.map((id) => ({ id })) },
		},
	})
}

/**
 * Une fiche créée par l'organisation, sans compte derrière: ce que l'invitation produit.
 * `isValidedByEvent`, que l'invitation pose, est ce qui ouvre le tunnel d'adhésion sur un
 * évènement encore en brouillon.
 */
export function seedInvitedMember(
	eventId: string,
	member: { firstName: string; lastName: string; email?: string; leaderOf?: string[] }
) {
	const { leaderOf = [], ...rest } = member
	return prisma.member.create({
		data: {
			eventId,
			isValidedByEvent: true,
			avatarPlaceholder: AVATAR_PLACEHOLDER,
			isNotifiedSubscribe: !!member.email,
			isNotifiedLeaderOfSubscribe: !!member.email,
			isNotifiedAdminOfNewMember: !!member.email,
			...rest,
			leaderOf: { connect: leaderOf.map((id) => ({ id })) },
		},
	})
}

export function seedTeam(eventId: string, name: string, state: TeamState = 'draft') {
	return prisma.team.create({ data: { eventId, name, state } })
}

/**
 * Un créneau à venir. Les dates de l'évènement ne suivent pas, faute de la synchronisation que ce
 * client n'a pas, ce dont aucun test n'a besoin: elles n'encadrent rien côté lecture.
 */
export function seedPeriod(teamId: string, { inDays = 7, hours = 2, maxSubscribe = 4 } = {}) {
	const start = new Date()
	start.setDate(start.getDate() + inDays)
	start.setMinutes(0, 0, 0)
	const end = new Date(start.getTime() + hours * 60 * 60 * 1000)
	return prisma.period.create({ data: { teamId, start, end, maxSubscribe } })
}

export function seedField(
	eventId: string,
	field: {
		name: string
		type: FieldType
		options?: string[]
		memberCanRead?: boolean
		memberCanWrite?: boolean
		required?: boolean
	}
) {
	const { options, memberCanRead = true, memberCanWrite = true, ...rest } = field
	return prisma.field.create({
		data: {
			eventId,
			memberCanRead,
			memberCanWrite,
			// La colonne porte un tableau JSON sérialisé, tel que `InputOptions` le soumet.
			options: options && JSON.stringify(options),
			...rest,
		},
	})
}

/**
 * Ce que ferait le clic sur le lien reçu par email. La recopie sur les `Member` est faite à la
 * main: le client d'ici n'est pas celui, étendu, de `$lib/server/prisma.ts`.
 */
export async function verifyEmail({ email }: Pick<SeededUser, 'email'>) {
	await prisma.user.update({ where: { email }, data: { isEmailVerified: true } })
	await prisma.member.updateMany({ where: { email }, data: { isEmailVerified: true } })
}

/**
 * Le jeton que porte le lien de vérification. `EMAIL_DISABLED` interdit de le lire depuis le
 * navigateur: il est posé en base, avec la durée de vie que lui donne `generateToken`.
 */
export async function seedEmailVerificationToken(user: Pick<SeededUser, 'id'>) {
	const id = cuid.createId()
	await prisma.token.create({
		data: {
			id,
			type: 'emailVerification',
			expires: Date.now() + 2 * 60 * 60 * 1000,
			userId: user.id,
		},
	})
	return id
}
