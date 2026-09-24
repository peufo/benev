import { prisma } from '../prisma'
import { createScheduler, type Scheduler, type TaskStore } from '../scheduler'
import { teamSchedule } from './teamSchedule'

/**
 * Les tâches planifiées de l'application et leur ticker. À importer par ce chemin, jamais par le
 * baril `$lib/server`: `startScheduler` s'appelle à l'évaluation de `hooks.server.ts`, et le
 * baril participe à un cycle (voir `rateLimit.ts`).
 */

const tasks = [teamSchedule]

/** Le curseur de chaque tâche vit en base: c'est lui qui permet de rattraper un arrêt. */
const store: TaskStore = {
	load: (name) => prisma.taskRun.findUnique({ where: { name } }),
	save: async (name, run) => {
		await prisma.taskRun.upsert({ where: { name }, create: { name, ...run }, update: run })
	},
}

// Une seule instance par processus. En dev, Vite réévalue `hooks.server.ts` à chaque
// modification: le ticker précédent doit s'éteindre avant que le suivant ne parte.
const scope = globalThis as { __benevScheduler?: Scheduler }

export function getScheduler() {
	scope.__benevScheduler ??= createScheduler(tasks, store)
	return scope.__benevScheduler
}

export async function startScheduler() {
	await stopScheduler()
	scope.__benevScheduler = createScheduler(tasks, store)
	scope.__benevScheduler.start()
}

export async function stopScheduler() {
	await scope.__benevScheduler?.stop()
}

/** Ce que `/root/tasks` affiche: la mémoire du processus, complétée par la base après un redémarrage. */
export async function getTasksStatus() {
	const status = getScheduler().status()
	const runs = await prisma.taskRun.findMany({ where: { name: { in: status.map((s) => s.name) } } })
	return status.map((task) => ({
		...task,
		last: task.last ?? runs.find((run) => run.name === task.name) ?? null,
	}))
}
