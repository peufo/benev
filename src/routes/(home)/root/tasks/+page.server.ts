import { getTasksStatus } from '$lib/server/tasks'

export const load = async () => ({ tasks: await getTasksStatus() })
