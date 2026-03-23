import { periodIsComplet } from '$lib/period'
import { parseFormKey, prisma } from '$lib/server'

export type FormDataPeriod = Awaited<ReturnType<typeof getPeriod>>

async function getPeriod(id: string) {
	const period = await prisma.period.findUniqueOrThrow({
		where: { id },
		include: {
			team: true,
			tags: true,
			subscribes: {
				include: {
					member: true,
				},
			},
		},
	})

	return {
		...period,
		isComplet: periodIsComplet(period),
	}
}

export const getPeriodForm = (periodIdOrJson: string | undefined) =>
	parseFormKey(periodIdOrJson, getPeriod, (period) => {
		if (!period) return undefined
		return {
			...period,
			...(period.start ? { start: new Date(period.start) } : {}),
			...(period.end ? { end: new Date(period.end) } : {}),
		}
	})
