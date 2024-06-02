import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { jsonParse, z } from 'fuma'
import { getTeam, prisma } from '$lib/server'
import { getMemberProfile } from '$lib/server'

export const load = async ({ parent, url, params: { eventId } }) => {
	const { user } = await parent()
	const userId = user?.id || ''
	try {
		const { form_team, form_field, form_period } = parseQuery(url, {
			form_team: z.string().optional(),
			form_field: z.string().optional(),
			form_period: z.string().optional(),
		})

		const member = await getMemberProfile({ userId, eventId }).catch(() => undefined)
		const isLeader = member?.roles.includes('leader')

		const event = await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				memberFields: {
					where: isLeader ? {} : { memberCanRead: true },
					orderBy: { position: 'asc' },
				},
			},
		})

		const memberCanRegister =
			!member?.isValidedByUser && (event.selfRegisterAllowed || member?.isValidedByEvent)

		return {
			userId: user?.id || '',
			event,
			member,
			memberCanRegister,
			pages: await prisma.page.findMany({
				where: { eventId, type: { not: 'email' } },
				select: { id: true, title: true, path: true, type: true },
			}),
			team: await getIfDefined(form_team, (id) => getTeam(id).catch(() => undefined)),
			field: await getIfDefined(form_field, (id) =>
				prisma.field.findUnique({ where: { id, eventId } })
			),
			period: await parseFormKey(
				form_period,
				(id) =>
					prisma.period.findUnique({
						where: { id },
						include: {
							subscribes: {
								include: {
									member: {
										include: {
											user: {
												select: { firstName: true, lastName: true, email: true, phone: true },
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
			),
		}
	} catch {
		error(404, 'not found')
	}
}

function getIfDefined<Fun extends (id: string) => any>(
	id: string | undefined,
	fun: Fun
): ReturnType<Fun> | undefined {
	if (!id || id.length < 5) return undefined
	return fun(id)
}

// TODO: add to fuma ?
function parseFormKey<Fun extends (key: string) => any>(
	key: string | undefined,
	fun: Fun,
	transform?: (
		data: Partial<Awaited<ReturnType<Fun>>>
	) => undefined | Partial<Awaited<ReturnType<Fun>>>
): undefined | ReturnType<Fun> | Partial<Awaited<ReturnType<Fun>>> {
	if (key === undefined) return undefined
	const isCUID = key.length === 25 && key.match(/\w{25}/)
	if (isCUID) return fun(key)
	const data = jsonParse<Partial<Awaited<ReturnType<Fun>>>>(key, {})
	return transform ? transform(data) : data
}
