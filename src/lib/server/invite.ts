import type { Cookies } from '@sveltejs/kit'
import { dev } from '$app/env'
import { sendEmailModel } from './email'
import { getMemberProfile } from './member'
import { prisma } from './prisma'
import { generateInviteToken, readValidInviteToken } from './token'

type InvitedMember = { id: string; eventId: string; email: string; event: { name: string } }
type Inviter = { firstName: string; lastName: string; email: string }

/**
 * L'email d'invitation. Deux gestes l'envoient: la création du membre, et le renvoi depuis sa
 * fiche — typiquement quand l'adresse vient d'être corrigée. Le jeton tourne à chaque envoi, ce
 * qui règle justement ce cas: le lien parti à la mauvaise adresse ne vaut plus rien.
 */
export async function sendInviteEmail(member: InvitedMember, author: Inviter) {
	const tokenId = await generateInviteToken(member.id)
	await sendEmailModel(member.eventId, 'invitation_create', {
		from: member.event.name,
		to: member.email,
		replyTo: author.email,
		subject: 'Invitation',
		props: {
			authorName: `${author.firstName} ${author.lastName}`,
			member: await getMemberProfile({ id: member.id }),
			tokenId,
		},
		// Un échec d'envoi atterrit ainsi sur la fiche de l'invité, et pas seulement dans le
		// journal de l'évènement: « l'invitation n'est jamais arrivée » est le cas numéro un.
		logContext: { memberId: member.id },
	})
}

/**
 * Le jeton voyage en cookie et non en paramètre d'URL: il doit survivre à l'aller-retour OAuth et
 * aux quatre requêtes du tunnel d'inscription. `httpOnly` le garde hors de portée du navigateur —
 * ce que la page de connexion en apprend passe par `getInvite`, qui n'en rend jamais la valeur.
 */
export const INVITE_COOKIE = 'invite_token'

export function setInviteCookie(cookies: Cookies, tokenId: string) {
	cookies.set(INVITE_COOKIE, tokenId, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24,
	})
}

export function clearInviteCookie(cookies: Cookies) {
	cookies.delete(INVITE_COOKIE, { path: '/' })
}

/** Le membre que le cookie désigne, si son jeton ouvre encore quelque chose. */
export async function getInvitedMember(cookies: Cookies) {
	const tokenId = cookies.get(INVITE_COOKIE)
	if (!tokenId) return null
	return readValidInviteToken(tokenId)
}

/**
 * Les adresses se comparent sans casse: une majuscule de plus n'est pas une autre boîte, et la
 * collation MySQL rend déjà le même compte pour `Claire@x.ch` et `claire@x.ch`.
 */
export const isSameEmail = (a?: string | null, b?: string | null) =>
	!!a && !!b && a.toLowerCase() === b.toLowerCase()

export type Invite = {
	eventId: string
	eventName: string
	firstName: string
	lastName: string
	email: string
	/** Décide du mode du formulaire: se connecter plutôt que créer un compte de plus. */
	hasAccount: boolean
}

/** Ce que la page de connexion a le droit de savoir de l'invitation en cours. */
export async function getInvite(cookies: Cookies): Promise<Invite | null> {
	const member = await getInvitedMember(cookies)
	if (!member?.email) return null
	const account = await prisma.user.findUnique({
		where: { email: member.email },
		select: { id: true },
	})
	return {
		eventId: member.eventId,
		eventName: member.event.name,
		firstName: member.firstName,
		lastName: member.lastName,
		email: member.email,
		hasAccount: !!account,
	}
}

/**
 * L'invitation revendiquée par le compte qui vient d'ouvrir une session. Le jeton n'a été délivré
 * qu'à cette adresse: la présenter vaut la preuve d'accès que demande le lien de vérification,
 * d'où l'email validé sans second message.
 *
 * L'écriture passe par le client étendu et non par `auth.updateUserAttributes`, seul moyen que le
 * drapeau soit recopié sur les `Member` — ce dont dépend `userEmailVerifiedRequired`.
 *
 * Le jeton, lui, survit: le tunnel s'en sert encore pour retrouver le membre jusqu'à l'adhésion.
 */
export async function claimInvite(
	cookies: Cookies,
	user: { id: string; email: string; isEmailVerified: boolean }
) {
	const member = await getInvitedMember(cookies)
	// Une adresse qui ne correspond pas est le cas ordinaire de la boîte partagée: le jeton prouve
	// l'accès à *cette* boîte, il n'autorise rien pour une autre.
	if (!member || !isSameEmail(member.email, user.email)) return null
	if (!user.isEmailVerified) {
		await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } })
	}
	return member
}
