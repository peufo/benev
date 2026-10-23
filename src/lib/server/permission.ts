import { error, redirect } from '@sveltejs/kit'
import { ROOT_USER } from '$app/env/private'
import { prisma } from '#lib/server/index.js'
import { isTierQuotaReached } from '#lib/server/tierQuota.js'
import { resolve } from '$app/paths'
import {
	type MemberRole,
	type MemberWithComputedValuesAndAccount,
	getMemberProfile,
} from '#lib/server/member.js'
import type { Session } from 'lucia'
import { Prisma } from '@prisma/client'
import { ROLE_LABELS } from '#lib/member/roles.js'

export const permission = {
	root: rootPermission,
	// Le quota ferme l'espace de gestion, pas celui des bénévoles: un geste de responsable qui
	// passe par ce garde remonte à `leader` ou `admin`, qui le contrôlent.
	member: createMemberPermissionWithoutQuotaCheck('member'),
	leader: createMemberPermission('leader'),
	admin: createMemberPermission('admin'),
	owner: createMemberPermission('owner'),
	memberOrRoot: createMemberOrRootPermission('member'),
	leaderOrRoot: createMemberOrRootPermission('leader'),
	adminOrRoot: createMemberOrRootPermission('admin'),
	ownerOrRoot: createMemberOrRootPermission('owner'),
	leaderOfTeam,
	leaderWithoutQuotaCheck: createMemberPermissionWithoutQuotaCheck('leader'),
}

async function rootPermission(locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) error(401)
	if (session.user.email !== ROOT_USER) error(403, "Réservé à l'équipe benevio")
	return session.user
}

function createMemberPermission(role: MemberRole) {
	return async (
		eventId: string,
		locals: App.Locals
	): Promise<MemberWithComputedValuesAndAccount> => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		return checkMemberRole(session, eventId, role)
	}
}

function createMemberOrRootPermission(role: MemberRole) {
	return async (
		eventId: string,
		locals: App.Locals
	): Promise<MemberWithComputedValuesAndAccount | null> => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		if (session.user.email === ROOT_USER) return null
		return checkMemberRole(session, eventId, role)
	}
}

function createMemberPermissionWithoutQuotaCheck(role: MemberRole) {
	return async (
		eventId: string,
		locals: App.Locals
	): Promise<MemberWithComputedValuesAndAccount> => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		return checkMemberRole(session, eventId, role, false)
	}
}

async function checkMemberRole(
	session: Session,
	eventId: string,
	role: MemberRole,
	checkQuota = true
): Promise<MemberWithComputedValuesAndAccount> {
	// Seule l'absence de fiche est un refus attendu. Toute autre erreur de lecture remonte en 500,
	// pour que `handleError` la journalise au lieu d'en faire passer le texte au client.
	const member = await getMemberProfile({ userId: session.user.id, eventId }).catch((err) => {
		if (isRecordNotFound(err)) error(403, 'Tu ne fais pas partie de cet évènement')
		throw err
	})
	if (!member.roles.includes(role)) error(403, `Ce geste demande le rôle ${ROLE_LABELS[role]}`)
	if (checkQuota && (await isTierQuotaReached(member.event))) {
		error(403, 'Quota de ton offre atteint')
	}
	return { ...member, email: session.user.email, userId: session.user.id }
}

function isRecordNotFound(err: unknown) {
	return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'
}

async function leaderOfTeam(
	teamId: string,
	locals: App.Locals
): Promise<MemberWithComputedValuesAndAccount> {
	const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
	const member = await createMemberPermission('leader')(team.eventId, locals)
	if (!member.roles.includes('admin')) {
		const isLeaderOfTeam = member.leaderOf.find((t) => t.id === teamId)
		if (!isLeaderOfTeam) error(403)
	}
	return member
}

export function redirectToAuth(url: URL) {
	return redirect(302, `/auth?redirectTo=${url.pathname}`)
}
export function redirectToRegister(eventId: string, url: URL) {
	return redirect(302, resolve('/[eventId]/register', { eventId }) + `?redirectTo=${url.pathname}`)
}
export async function getUserIdOrRedirect(url: URL, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw redirectToAuth(url)
	return session.user.id
}
export async function getUserOrRedirect(url: URL, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw redirectToAuth(url)
	return session.user
}
