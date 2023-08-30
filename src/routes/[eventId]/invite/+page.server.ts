import { error, redirect } from '@sveltejs/kit'
import { memberShema } from '$lib/form'
import { parseFormData, prisma, tryOrFail, sendEmailTemplate } from '$lib/server'
import { EmailNewMember, EmailNewMemberNotification } from '$lib/email'

export const load = async ({ locals, params }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(301, `/${params.eventId}/me?callback=/${params.eventId}/invite`)
}

export const actions = {
	new_member: async ({ request, locals, params }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, memberShema)
		if (err) return err

		const isValidedByUser = session.user.id === data.userId

		return tryOrFail(async () => {
			const member = await prisma.member.create({
				data: {
					...data,
					eventId: params.eventId,
					isValidedByUser,
				},
				include: {
					user: true,
					event: {
						include: {
							owner: true,
							memberFields: true,
						},
					},
				},
			})

			await Promise.all([
				sendEmailTemplate(EmailNewMember, {
					from: member.event.name,
					to: member.user.email,
					subject: `${member.event.name} - Nouveau membre`,
					props: { member },
				}),
				sendEmailTemplate(EmailNewMemberNotification, {
					from: member.event.name,
					to: member.event.owner.email,
					subject: `${member.event.name} - Nouveau membre`,
					props: { member },
				}),
			])
		})
	},
}
