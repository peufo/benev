import { getEventMembers, partitionEventMembers } from './events.server'

export const load = async ({ parent }) => {
	const { user } = await parent()
	const { invitations, upcoming, undated, past } = partitionEventMembers(
		await getEventMembers(user)
	)

	// Les évènements terminés vivent sur `/me/events/past`: ici on n'en garde que le
	// compte, qui sert de libellé au bouton d'accès.
	return { invitations, upcoming, undated, nbPast: past.length }
}
