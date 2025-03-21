import { parseFormKey, prisma, safeUserSelect } from '$lib/server'

export const getPeriodForm = (periodIdOrJson: string | undefined) =>
	parseFormKey(
		periodIdOrJson,
		(id) =>
			prisma.period.findUnique({
				where: { id },
				include: {
					team: true,
					tags: true,
					subscribes: {
						include: {
							member: {
								include: {
									user: {
										select: safeUserSelect,
									},
								},
							},
						},
					},
				},
			}),
		(period) => {
			if (!period) return undefined
			return {
				...period,
				...(period.start ? { start: new Date(period.start) } : {}),
				...(period.end ? { end: new Date(period.end) } : {}),
			}
		}
	)
