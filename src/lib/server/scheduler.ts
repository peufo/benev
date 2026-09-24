/**
 * Le ticker des tâches planifiées. Un seul processus fait tourner l'application: une minuterie
 * dans la boucle d'évènements suffit, sans cron externe ni table de jobs.
 *
 * Chaque tâche reçoit une fenêtre `(since, until]`, où `since` est le curseur persisté de son
 * dernier passage réussi. Une date programmée s'applique donc **une fois**, quand l'instant passe:
 * une date déjà passée ne rejoue jamais, un redémarrage rattrape ce qu'il a manqué, et rien n'est
 * lu « au niveau » (un réglage par défaut dans le passé ne défait pas un geste manuel).
 *
 * Ce module ne connaît ni prisma ni les tâches: il reçoit un `TaskStore` et se teste aux faux
 * timers. La liste des tâches et le store en base vivent dans `$lib/server/tasks`.
 */

export type TaskWindow = { since: Date; until: Date }

export type Task = {
	name: string
	/** Délai minimal entre deux passages, en millisecondes. */
	every: number
	/**
	 * Idempotente sur sa fenêtre: un échec ne fait pas avancer le curseur, et la même fenêtre
	 * revient au passage suivant. Rend le nombre d'effets produits, pour la page root.
	 */
	run: (window: TaskWindow) => Promise<number>
}

export type TaskRunRecord = {
	cursor: Date
	ranAt: Date
	/** Millisecondes. */
	duration: number
	count: number
	error: string | null
}

export type TaskStore = {
	load: (name: string) => Promise<TaskRunRecord | null>
	save: (name: string, run: TaskRunRecord) => Promise<void>
}

export type TaskStatus = {
	name: string
	every: number
	running: boolean
	last: TaskRunRecord | null
}

export type Scheduler = ReturnType<typeof createScheduler>

export function createScheduler(tasks: Task[], store: TaskStore, { tick = 60_000 } = {}) {
	const last = new Map<string, TaskRunRecord>()
	const running = new Map<string, Promise<TaskRunRecord>>()
	let timer: ReturnType<typeof setInterval> | undefined
	let stopped = false

	function find(name: string) {
		const task = tasks.find((task) => task.name === name)
		if (!task) throw new Error(`Tâche inconnue: ${name}`)
		return task
	}

	async function execute(task: Task): Promise<TaskRunRecord> {
		const pending = running.get(task.name)
		if (pending) return pending
		const promise = (async () => {
			const previous = last.get(task.name) ?? (await store.load(task.name))
			const until = new Date()
			// Sans repère, la fenêtre est vide: on pose le curseur sans rejouer l'histoire.
			const since = previous?.cursor ?? until
			const started = Date.now()
			let record: TaskRunRecord
			try {
				const count = await task.run({ since, until })
				record = { cursor: until, ranAt: until, duration: Date.now() - started, count, error: null }
			} catch (err) {
				console.error(`[tasks] ${task.name} a échoué`, err)
				record = {
					cursor: since,
					ranAt: until,
					duration: Date.now() - started,
					count: 0,
					error: err instanceof Error ? err.message : String(err),
				}
			}
			last.set(task.name, record)
			// Le store est le second point de défaillance: son échec ne doit pas rester coincé
			// dans `running`, ni cacher le passage qui vient d'avoir lieu.
			await store.save(task.name, record).catch((err) => {
				console.error(`[tasks] ${task.name}: état non enregistré`, err)
			})
			return record
		})()
		running.set(task.name, promise)
		try {
			return await promise
		} finally {
			running.delete(task.name)
		}
	}

	function isDue(task: Task, now: number) {
		if (running.has(task.name)) return false
		const previous = last.get(task.name)
		return !previous || now - previous.ranAt.getTime() >= task.every
	}

	/** Les tâches dues, en série: deux tâches qui écrivent la même table ne se marchent pas dessus. */
	async function pass() {
		const now = Date.now()
		for (const task of tasks) {
			if (stopped) return
			if (isDue(task, now)) await execute(task)
		}
	}

	return {
		/** Un passage immédiat, puis un à chaque `tick`. */
		start() {
			if (timer) return
			stopped = false
			void pass()
			timer = setInterval(() => void pass(), tick)
			// La minuterie ne doit pas retenir le conteneur au redémarrage: `stop` attend ce qui
			// est en cours, et le reste attendra le prochain démarrage.
			timer.unref?.()
		},
		/** Coupe la minuterie et attend la tâche en cours, sans dépasser `timeout`. */
		async stop({ timeout = 10_000 } = {}) {
			stopped = true
			clearInterval(timer)
			timer = undefined
			const pending = [...running.values()]
			if (!pending.length) return
			let guard: ReturnType<typeof setTimeout> | undefined
			await Promise.race([
				Promise.allSettled(pending),
				new Promise((resolve) => {
					guard = setTimeout(resolve, timeout)
				}),
			])
			clearTimeout(guard)
		},
		/** Exécute une tâche sans attendre son échéance, et rend son passage. */
		runNow(name: string) {
			return execute(find(name))
		},
		status(): TaskStatus[] {
			return tasks.map((task) => ({
				name: task.name,
				every: task.every,
				running: running.has(task.name),
				last: last.get(task.name) ?? null,
			}))
		},
	}
}
