import { getTasksStatus } from '#lib/server/tasks/index.js'

export const load = async () => ({ tasks: await getTasksStatus() })
