import { error } from '@sveltejs/kit'
import { getTeam, permission } from '$lib/server'

export const load = async ({ parent, locals, params: { eventId, teamId } }) => {
	const actor = await permission.leaderOrRoot(eventId, locals)
	const { event } = await parent()

	// Le root n'est responsable de rien: sans ce drapeau, `useAddTeamComputedValues` le rangerait
	// en lecture seule sur tous les secteurs.
	const ctx = actor ? { member: actor, event } : { event, isLeader: true }
	const team = await getTeam(teamId, ctx).catch(() => error(404, 'not found'))

	// `getTeam` ne cherche que par `id`: sans cette vérification, le secteur d'un autre évènement
	// se lirait depuis n'importe quelle URL.
	if (team.eventId !== eventId) error(404, 'not found')

	return { team }
}
