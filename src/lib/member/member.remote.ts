import { error, invalid, redirect, type RemoteFormInput } from '@sveltejs/kit'
import { form, getRequestEvent, query } from '$app/server'
import type { Field, FieldType } from '@prisma/client'
import z from 'zod'
import {
	clearInviteCookie,
	consumeInviteToken,
	createAvatarPlaceholder,
	createLog,
	getMemberProfile,
	notifyTierQuotaIfNeeded,
	permission,
	prisma,
	sendEmailComponent,
	sendEmailModel,
	sendInviteEmail,
	uniqueIssue,
} from '$lib/server'
import { EmailAcceptInviteNotification } from '$lib/email'
import { modelInvite, modelMemberCondition, modelMemberSetting } from '$lib/models'
import { diffChanges, hasChanges, projectProfile } from '$lib/log'
import { isMemberAllowed } from './conditions/isMemberAllowed'

/**
 * Ces formulaires vivent dans `$lib/member` et non à côté d'une route: ils sont montés depuis
 * `[eventId]/me`, `[eventId]/register` et `[eventId]/admin/members`. `getRequestEvent().params`
 * reste renseigné dans tous les cas — SvelteKit rejoue le matching depuis la page appelante.
 */

export const updateMemberSettings = form(modelMemberSetting, async (data) => {
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

	// La cible n'est pas forcément l'acteur: c'est son profil qu'on complète, pas celui du
	// responsable qui l'édite.
	const target = editOwnProfile
		? member
		: await prisma.member.findUniqueOrThrow({ where: { id: memberId, eventId } })

	const updated = await prisma.member.update({
		where: { id: memberId },
		data: {
			profileJson: {
				...target.profileJson,
				...parsed.data,
			},
		},
	})

	// `fields` tient la liste blanche: ce que l'acteur n'avait pas le droit d'écrire n'a pas pu
	// changer, et n'a donc rien à faire dans le diff.
	const profile = diffChanges(
		projectProfile(fields, target.profileJson),
		projectProfile(fields, updated.profileJson)
	)
	if (hasChanges(profile))
		await createLog('member_update', { member: updated, actor: member, profile })

	return updated
})

type ProfileValue = string | string[] | number | boolean | undefined

function buildModelMemberProfile(fields: Field[], isPartial: boolean) {
	const model: Record<string, z.ZodType<ProfileValue, ProfileValue>> = {}

	const requiredError = 'Valeur manquante'

	const modelByType = {
		// Cocher est le seul geste possible: un booléen obligatoire n'a rien à exiger de plus.
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

export const createInvite = form(modelInvite, async ({ sendEmail, leaderOf, ...data }, issue) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const author = await permission.leader(eventId, locals)

	// Distribuer un rôle reste réservé aux administrateurs, comme dans `updateTeam`: les champs
	// ne sont pas rendus aux autres, et un formulaire forgé ne doit pas contourner la règle.
	if ((leaderOf.length || data.isAdmin) && !author.roles.includes('admin')) error(403)

	if (data.email) {
		const alreadyMember = await prisma.member.findFirst({
			where: { eventId, email: data.email },
			select: { firstName: true, lastName: true },
		})
		if (alreadyMember)
			invalid(
				issue.email(
					`${alreadyMember.firstName} ${alreadyMember.lastName} utilise déjà cette adresse`
				)
			)
	}

	// La relation many-to-many ne connaît pas l'évènement: relire les secteurs vaut validation des
	// ids reçus, et donne les noms que le journal fige.
	const teams = leaderOf.length
		? await prisma.team.findMany({
				where: { id: { in: leaderOf }, eventId },
				select: { id: true, name: true },
			})
		: []
	if (teams.length !== leaderOf.length) error(400, 'Secteur inconnu')

	const member = await prisma.member
		.create({
			data: {
				...data,
				eventId,
				isValidedByEvent: true,
				avatarPlaceholder: createAvatarPlaceholder(),
				isNotifiedSubscribe: !!data.email,
				isNotifiedLeaderOfSubscribe: !!data.email,
				isNotifiedAdminOfNewMember: !!data.email,
				leaderOf: { connect: teams.map(({ id }) => ({ id })) },
			},
			include: { event: true },
		})
		// Deux invitations simultanées passent toutes deux le test ci-dessus: c'est la
		// contrainte de la base qui tranche, et son message doit rester sous le champ.
		.catch(uniqueIssue(issue.email('Cette adresse est déjà utilisée dans cet évènement')))

	await notifyTierQuotaIfNeeded(eventId)
	await createLog('member_invite', { member, actor: author, sendEmail, teams })

	if (!member.email || !sendEmail) return member

	await sendInviteEmail({ ...member, email: member.email }, author)

	return member
})

// TODO: DRAW A FUCKING WORKFLOW
export const acceptInvite = form(
	z.object({ redirectTo: z.string().optional() }),
	async ({ redirectTo }) => {
		const { locals, params, cookies } = getRequestEvent()
		const eventId = params.eventId!
		const session = await locals.auth.validate()
		if (!session) error(401)

		const isValidedByEvent = await permission
			.leader(eventId, locals)
			.then(() => true)
			.catch(() => false)

		// Si le membre existe déjà, on le link au user
		// TODO: update member contact details from user
		// Chercher aussi par `userId`: un membre déjà lié dont l'adresse a divergé n'est pas
		// retrouvé par la sienne, et la paire utilisateur/évènement est unique — la création
		// plus bas échouerait alors sur la contrainte.
		const memberAlreadyExist = await prisma.member.findFirst({
			where: { eventId, OR: [{ userId: session.user.id }, { email: session.user.email }] },
		})
		if (memberAlreadyExist) {
			const newIsValidedByEvent = isValidedByEvent || memberAlreadyExist.isValidedByEvent
			const linked = await prisma.member.update({
				where: { id: memberAlreadyExist.id },
				data: {
					userId: session.user.id,
					isValidedByEvent: newIsValidedByEvent,
				},
			})
			if (newIsValidedByEvent) await notifyTierQuotaIfNeeded(eventId)
			// L'adhésion est le terme du parcours d'invitation: le lien a fini son travail.
			await consumeInviteToken(linked.id)
			clearInviteCookie(cookies)
			await createLog('member_join', { member: linked, actor: session.user, wasInvited: true })
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
			},
		})
		if (isValidedByEvent) await notifyTierQuotaIfNeeded(eventId)
		const member = await getMemberProfile({ id })
		await createLog('member_join', { member, actor: session.user, wasInvited: false })
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
		if (isSelf && member.roles.includes('owner')) error(403, `Owner can't delete his participation`)
		const deleted = await prisma.member.delete({ where: { id: memberId, eventId } })
		await createLog('member_delete', { member: deleted, actor: member, isSelf })
		redirect(303, redirectTo || '/me')
	}
)

/** Alimente les selects de membre: invitation, responsables, aperçu de badge. */
export const searchMembers = query(z.object({ search: z.string() }), async ({ search }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.member.findMany({
		where: {
			eventId,
			OR: [
				{ lastName: { contains: search } },
				{ firstName: { contains: search } },
				{ email: { contains: search } },
			],
		},
		orderBy: { updatedAt: 'desc' },
		take: 10,
	})
})

/**
 * Le compte déjà ouvert derrière une adresse, pour pré-remplir une invitation. Le nom de
 * famille est réduit à son initiale: il ne s'agit pas de révéler l'identité d'un inconnu à
 * qui devine son adresse, mais de confirmer à un responsable qu'il vise la bonne personne.
 */
export const findUserByEmail = query(z.email(), async (email) => {
	const { locals, params } = getRequestEvent()
	await permission.leader(params.eventId!, locals)
	const user = await prisma.user.findFirst({ where: { email } })
	if (!user) return null
	return { firstName: user.firstName, lastName: `${user.lastName[0]}.` }
})

/**
 * Combien de membres satisferaient un jeu de conditions. L'aperçu du formulaire de secteur,
 * qui se rejoue à chaque retouche: la liste elle-même n'est jamais transmise.
 */
export const countMembersAllowed = query(
	z.array(modelMemberCondition),
	async (conditions): Promise<number> => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.leader(eventId, locals)
		const members = await prisma.member.findMany({ where: { eventId } })
		return members.filter((member) => isMemberAllowed(conditions, member)).length
	}
)
