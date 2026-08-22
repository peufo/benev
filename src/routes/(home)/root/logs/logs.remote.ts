import { getRequestEvent, query } from '$app/server'
import z from 'zod'
import { getLogs, permission } from '$lib/server'
import type { LogType } from '@prisma/client'
import { LOG_TYPES } from '$lib/log'

/** Le pendant root de `loadPreviousEventLogs`: tous évènements confondus, et tous types. */
export const loadPreviousRootLogs = query(
	z.object({
		beforeId: z.string(),
		type: z.enum(LOG_TYPES as [LogType, ...LogType[]]).optional(),
		take: z.number().min(1).max(100).default(30),
	}),
	async ({ beforeId, type, take }) => {
		const { locals } = getRequestEvent()
		await permission.root(locals)
		return getLogs(type ? { type } : {}, { take, beforeId })
	}
)
