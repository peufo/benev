/**
 * Le travail qu'une requête lance sans l'attendre: des centaines d'envois à la publication d'un
 * évènement dépasseraient le délai du proxy, et la personne verrait une erreur sur un geste déjà
 * fait. Le processus étant unique, une promesse suivie suffit; `settleBackground` la laisse finir
 * à l'arrêt, avant que la file d'e-mails ne se vide.
 *
 * Un travail long consulte `isShuttingDown()` entre deux éléments: ce qu'il laisse garde son
 * marqueur, et partira au prochain geste qui le relâche.
 */

const running = new Set<Promise<void>>()
let shuttingDown = false

export function runInBackground(name: string, job: () => Promise<void>) {
	const promise = job()
		.catch((err) => console.error(`[background] ${name}`, err))
		.finally(() => running.delete(promise))
	running.add(promise)
}

export function isShuttingDown() {
	return shuttingDown
}

export async function settleBackground() {
	shuttingDown = true
	await Promise.all(running)
}
