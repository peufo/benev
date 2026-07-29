import { error, invalid, redirect, type RemoteFormInput } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import type { Field, FieldType } from '@prisma/client'
import z from 'zod'
import {
	createAvatarPlaceholder,
	getMemberProfile,
	notifyTierQuotaIfNeeded,
	permission,
	prisma,
	sendEmailComponent,
	sendEmailModel,
} from '$lib/server'
import { EmailAcceptInviteNotification } from '$lib/email'
import { modelInvite, modelMemberSetting } from '$lib/models'

/**
 * Ces formulaires vivent dans `$lib/member` et non à côté d'une route: ils sont montés depuis
 * `[eventId]/me`, `[eventId]/register` et `[eventId]/admin/members`. `getRequestEvent().params`
 * reste renseigné dans tous les cas — SvelteKit rejoue le matching depuis la page appelante.
 */

export const updateMemberSettings = form(z.object(modelMemberSetting), async (data) => {
	const { locals, params } = getRequestEvent()
	const member = await permission.member(params.eventId!, locals)
	return prisma.member.update({ where: { id: member.id }, data })
})

/**
 * Les champs de profil sont définis en base, par évènement: le schéma ne peut pas être statique.
 * D'où `form('unchecked', …)`, seule échappatoire prévue par SvelteKit, et une validation zod
 * construite à la volée dont les erreurs sont réinjectées via `invalid()`.
 */
export const updateMemberProfile = form('unchecked', async (input: RemoteFormInput) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const member = await permission.member(eventId, locals)
	const isLeader = member.roles.includes('leader')

	const { memberId } = input
	if (typeof memberId !== 'string') error(400, 'memberId manquant')
	const editOwnProfile = member.id === memberId
	if (!editOwnProfile && !isLeader) error(401)

	const fields = await prisma.field.findMany({
		where: {
			eventId,
			...(!isLeader && { memberCanWrite: true }),
		},
	})

	// `memberId` est validé à part: le schéma ne décrit que le profil, et zod écarte le reste.
	const parsed = z
		.object(buildModelMemberProfile(fields, isLeader && !editOwnProfile))
		.safeParse(input)
	if (!parsed.success) invalid(...parsed.error.issues)

	return prisma.member.update({
		where: { id: memberId },
		data: {
			profileJson: {
				...member.profileJson,
				...parsed.data,
			},
		},
	})
})

type ProfileValue = string | string[] | number | boolean | undefined

function buildModelMemberProfile(fields: Field[], isPartial: boolean) {
	const model: Record<string, z.ZodType<ProfileValue, ProfileValue>> = {}

	const requiredError = 'Valeur manquante'

	const modelByType = {
		// Une case décochée n'envoie rien: sans défaut, un booléen requis serait toujours en erreur.
		boolean: z.boolean().default(false),
		number: z.number({ error: requiredError }),
		string: z.string().min(1, { message: requiredError }),
		textarea: z.string().min(1, { message: requiredError }),
		select: z.string({ error: requiredError }).min(1, { message: requiredError }),
		multiselect: z.array(z.string()).min(1, { message: requiredError }),
	} satisfies Record<FieldType, z.ZodType<ProfileValue, ProfileValue>>

	const modelByTypeOptional = {
		boolean: z.boolean().default(false),
		number: z.number().optional(),
		string: z.string().optional(),
		textarea: z.string().optional(),
		select: z.string().optional(),
		multiselect: z.array(z.string()).default([]),
	} satisfies Record<FieldType, z.ZodType<ProfileValue, ProfileValue>>

	fields.forEach((f) => {
		if (isPartial || !f.required) model[f.id] = modelByTypeOptional[f.type]
		else model[f.id] = modelByType[f.type]
	})

	return model
}

export const createInvite = form(z.object(modelInvite), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const author = await permission.leader(eventId, locals)

	const member = await prisma.member.create({
		data: {
			...data,
			eventId,
			isValidedByEvent: true,
			avatarPlaceholder: createAvatarPlaceholder(),
			isNotifiedSubscribe: !!data.email,
			isNotifiedLeaderOfSubscribe: !!data.email,
			isNotifiedAdminOfNewMember: !!data.email,
		},
		include: { event: true },
	})

	await notifyTierQuotaIfNeeded(eventId)

	if (!member.email) return member

	await sendEmailModel(eventId, 'invitation_create', {
		from: member.event.name,
		to: member.email,
		replyTo: author.email,
		subject: 'Invitation',
		props: {
			authorName: `${author.firstName} ${author.lastName}`,
			member: await getMemberProfile({ id: member.id }),
		},
	})

	return member
})

// TODO: DRAW A FUCKING WORKFLOW
export const acceptInvite = form(
	z.object({ redirectTo: z.string().optional() }),
	async ({ redirectTo }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		const session = await locals.auth.validate()
		if (!session) error(401)

		const isValidedByEvent = await permission
			.leader(eventId, locals)
			.then(() => true)
			.catch(() => false)

		// Si le membre existe déjà, on le link au user
		// TODO: update member contact details from user
		const memberAlreadyExist = await prisma.member.findFirst({
			where: { eventId, email: session.user.email },
		})
		if (memberAlreadyExist) {
			const newIsValidedByEvent = isValidedByEvent || memberAlreadyExist.isValidedByEvent
			await prisma.member.update({
				where: { id: memberAlreadyExist.id },
				data: {
					userId: session.user.id,
					isValidedByEvent: newIsValidedByEvent,
					isValidedByUser: true,
				},
			})
			if (newIsValidedByEvent) await notifyTierQuotaIfNeeded(eventId)
			// TODO: mails to admins ?
			if (redirectTo) redirect(303, redirectTo)
			return
		}

		const { selfRegisterAllowed } = await prisma.event.findUniqueOrThrow({
			where: { id: eventId },
			select: { selfRegisterAllowed: true },
		})
		if (!selfRegisterAllowed) error(403)

		const { id } = await prisma.member.create({
			data: {
				userId: session.user.id,
				eventId,
				isValidedByEvent,
				isValidedByUser: true,
			},
		})
		if (isValidedByEvent) await notifyTierQuotaIfNeeded(eventId)
		const member = await getMemberProfile({ id })
		// TODO: impossible ... DRAW A DIAGRAM PLEASE
		if (member.email) {
			const admins = await prisma.member.findMany({
				where: {
					eventId,
					email: { not: null },
					isAdmin: true,
					isNotifiedAdminOfNewMember: true,
				},
			})
			const adminsEmail = admins.map((a) => a.email as string)

			await Promise.all([
				sendEmailModel(eventId, 'invitation_accept', {
					subject: 'Adhesion validée',
					from: member.event.name,
					to: member.email,
					props: { member },
					replyTo: adminsEmail,
				}),
				!!adminsEmail.length &&
					sendEmailComponent(EmailAcceptInviteNotification, {
						subject: 'Nouvelle adhesion',
						from: member.event.name,
						to: adminsEmail,
						props: { member },
						replyTo: member.email,
					}),
			])
		}

		if (redirectTo) redirect(303, redirectTo)
	}
)

export const deleteMember = form(
	z.object({ memberId: z.string(), redirectTo: z.string().optional() }),
	async ({ memberId, redirectTo }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		const member = await permission.member(eventId, locals)
		const isSelf = member.id === memberId
		if (!isSelf) await permission.admin(eventId, locals)
		if (isSelf && member.roles.includes('owner'))
			throw Error(`Owner can't delete his participation`)

		await prisma.member.delete({ where: { id: memberId, eventId } })
		redirect(303, redirectTo || '/me')
	}
)
