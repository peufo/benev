import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import z from 'zod'
import {
	prisma,
	getInvitedMember,
	getMemberProfile,
	parseFormKey,
	getPeriodForm,
} from '$lib/server'
import { eventMetaTags } from '$lib/seo'

export const load = async ({ parent, url, cookies, params: { eventId } }) => {
	const { user } = await parent()
	const userId = user?.id || ''
	try {
		const { form_field, form_period, form_tag } = parseQuery(url, {
			form_field: z.string().optional(),
			form_period: z.string().optional(),
			form_tag: z.string().optional(),
		})

		// Le jeton d'invitation est la troisième clé pour retrouver le membre: sans lui, un évènement
		// publié ne rattache personne par email, et l'invité bute sur « Invitation requise » avant
		// même l'adhésion. L'adresse doit correspondre — le jeton n'ouvre que la boîte à laquelle il
		// a été envoyé.
		//
		// Sans session il n'y a personne à rattacher, d'où la garde: `member` désigne partout
		// ailleurs un membre relié à un compte. C'est `data.invite`, posé par le layout racine et
		// lisible sans être connecté, qui porte l'invitation jusqu'au tunnel d'inscription.
		const invited = user ? await getInvitedMember(cookies) : null
		const invitedId =
			invited?.eventId === eventId && invited.email === user?.email ? invited.id : null

		const member =
			user &&
			(await getMemberProfile({
				eventId,
				OR: [
					{ userId },
					{ event: { state: 'draft' }, email: user.email },
					...(invitedId ? [{ id: invitedId }] : []),
				],
			}).catch(() => undefined))
		const isLeader = member?.roles.includes('leader') || member?.roles.includes('admin')

		const event = await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				owner: {
					select: {
						firstName: true,
					},
				},
				memberFields: {
					where: isLeader ? {} : { memberCanRead: true },
					orderBy: { position: 'asc' },
				},
			},
		})

		const memberCanRegister =
			!member?.userId && (event.selfRegisterAllowed || member?.isValidedByEvent)

		const membersValided = await prisma.member.count({
			where: { eventId, isValidedByEvent: true },
		})

		return {
			userId,
			event,
			member,
			memberCanRegister,
			membersValided,
			metaTags: eventMetaTags(event, url),
			pages: await prisma.page.findMany({
				where: { eventId, type: { not: 'email' } },
				select: { id: true, title: true, path: true, type: true },
			}),
			field: await parseFormKey(form_field, (id) =>
				prisma.field.findUnique({ where: { id, eventId } })
			),
			period: await getPeriodForm(form_period),
			tag: await parseFormKey(form_tag, (id) => prisma.tag.findUnique({ where: { id, eventId } })),
		}
	} catch {
		error(404, 'not found')
	}
}
