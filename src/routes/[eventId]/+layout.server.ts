import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import z from 'zod'
import {
	prisma,
	findClaimableMember,
	getMemberProfile,
	parseFormKey,
	getPeriodForm,
} from '$lib/server'
import { eventMetaTags } from '$lib/seo'

export const load = async ({ parent, url, cookies, params: { eventId } }) => {
	const { user, userIsRoot } = await parent()
	const userId = user?.id || ''
	try {
		const { form_field, form_period, form_tag } = parseQuery(url, {
			form_field: z.string().optional(),
			form_period: z.string().optional(),
			form_tag: z.string().optional(),
		})

		// La fiche de ce compte. Rien d'autre ne s'appelle `member`: les rôles, le menu de gestion et
		// les gardes de /admin en dépendent, et une invitation non honorée n'en donne aucun.
		const member = user
			? await getMemberProfile({ eventId, userId }).catch(() => undefined)
			: undefined

		// La fiche que le tunnel d'inscription peut revendiquer. `findClaimableMember` en est le seul
		// juge — l'adhésion et le refus s'y rapportent aussi. Sans compte relié, elle n'ouvre rien
		// d'autre que /register.
		//
		// Sans session il n'y a personne à rattacher, d'où la garde: c'est `data.invite`, posé par le
		// layout racine et lisible sans être connecté, qui porte l'invitation jusqu'au tunnel.
		const claimable = !member && user ? await findClaimableMember(cookies, user, eventId) : null
		const memberToClaim = claimable
			? await getMemberProfile({ id: claimable.id }).catch(() => undefined)
			: undefined

		// Une fiche porte cette adresse sans que le compte l'ait prouvée — ni jeton, ni vérification.
		// Le calcul vit ici et non dans le tunnel: c'est aussi ce qui ouvre l'évènement en brouillon,
		// dont l'espace est fermé aux bénévoles et où le tunnel est le seul endroit où le dire.
		const emailToVerify =
			user &&
			!member &&
			!memberToClaim &&
			!user.isEmailVerified &&
			(await prisma.member.count({ where: { eventId, userId: null, email: user.email } }))
				? user.email
				: null

		const isLeader = member?.roles.includes('leader') || member?.roles.includes('admin')
		const isAdmin = member?.roles.includes('admin') || userIsRoot

		const event = await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				owner: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
				memberFields: {
					where: isLeader ? {} : { memberCanRead: true },
					orderBy: { position: 'asc' },
				},
			},
		})

		const memberCanRegister =
			!member && (event.selfRegisterAllowed || memberToClaim?.isValidedByEvent)

		const membersValided = await prisma.member.count({
			where: { eventId, isValidedByEvent: true },
		})

		return {
			userId,
			event,
			member,
			memberToClaim,
			emailToVerify,
			memberCanRegister,
			membersValided,
			metaTags: eventMetaTags(event, url),
			// Une seule source pour la navigation publique et le volet d'administration: les
			// brouillons n'en sortent que pour les admins, leur titre ne quitte pas le serveur sinon.
			pages: await prisma.page.findMany({
				where: { eventId, type: { not: 'email' }, ...(!isAdmin && { state: 'published' }) },
				select: { id: true, title: true, path: true, type: true, state: true },
				orderBy: { position: 'asc' },
			}),
			field: await parseFormKey(form_field, (id) =>
				prisma.field.findUnique({ where: { id, eventId } })
			),
			period: await getPeriodForm(form_period, eventId),
			tag: await parseFormKey(form_tag, (id) => prisma.tag.findUnique({ where: { id, eventId } })),
		}
	} catch {
		error(404, 'not found')
	}
}
