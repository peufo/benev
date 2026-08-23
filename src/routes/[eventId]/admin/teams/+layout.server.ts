import { permission, prisma } from '$lib/server'

export const load = async ({ locals, params: { eventId } }) => {
	// `admin/+layout.server.ts` a déjà refusé les non-responsables: ce garde ne sert qu'à
	// identifier l'acteur. Il rend `null` pour le root, qui n'est responsable de rien.
	const actor = await permission.leaderOrRoot(eventId, locals)

	// Un responsable voit tous les secteurs — en lecture seule sur ceux qu'il ne dirige pas.
	const teamsRaw = await prisma.team.findMany({
		where: { eventId },
		orderBy: { position: 'asc' },
		select: {
			id: true,
			name: true,
			leaders: { select: { id: true } },
			periods: {
				select: {
					maxSubscribe: true,
					// La liste ne rend qu'une jauge: les refus et annulations n'y entrent pas.
					subscribes: {
						where: { state: { in: ['accepted', 'request'] } },
						select: {
							state: true,
							isForcedValidation: true,
							member: { select: { userId: true } },
						},
					},
				},
			},
		},
	})

	// Un secteur se réduit à ce que `Progress` consomme: la somme des places de ses périodes et
	// leurs inscriptions mises à plat.
	const teams = teamsRaw.map(({ id, name, periods }) => ({
		id,
		name,
		nbPeriods: periods.length,
		maxSubscribe: periods.reduce((acc, period) => acc + period.maxSubscribe, 0),
		subscribes: periods.flatMap((period) => period.subscribes),
	}))

	// La mise en avant suit les responsables déclarés, pas `isLeader`: celui-ci vaut `true` pour
	// tout admin, et le partage en deux groupes n'aurait plus rien à distinguer.
	const myTeamIds = actor
		? teamsRaw.filter((team) => team.leaders.some(({ id }) => id === actor.id)).map(({ id }) => id)
		: []

	return { teams, myTeamIds }
}
