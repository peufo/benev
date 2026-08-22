import { env } from '$env/dynamic/private'
import nodemailer, { type SendMailOptions } from 'nodemailer'
import type { EmailFailureReason, EmailRelations } from '$lib/log/logMap'
import { createLog } from './log'
import { isPermanentError, nextDelay } from './emailRetry'
import { toAddressList } from './recipients'

/**
 * Un envoi SMTP coûte une poignée de main TLS et parfois plusieurs secondes; l'attendre dans le
 * fil de la requête faisait payer cette latence à l'utilisateur avant sa redirection. Les messages
 * sont donc mis en file et drainés en tâche de fond, un à la fois.
 *
 * La file vit en mémoire. Ce qui est durable, ce n'est pas elle mais la ligne `Log` écrite après
 * chaque tentative: une file est un état mutable éphémère, un journal est append-only. Un arrêt
 * brutal peut donc perdre un message — mais plus jamais en silence, `drainEmailQueue` journalisant
 * ce qu'il abandonne.
 */

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: Number(env.SMTP_PORT),
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
	// Le worker est sérialisé: une seule connexion, gardée ouverte d'un message au suivant plutôt
	// que rouverte à chaque fois.
	pool: true,
	maxConnections: 1,
	maxMessages: 100,
	// Sans ces bornes, une socket pendue immobilise la file entière.
	connectionTimeout: 10_000,
	greetingTimeout: 10_000,
	socketTimeout: 30_000,
})

/**
 * Coupe tout envoi, quelle que soit l'adresse. Positionné par la CI et par le webServer
 * Playwright. Les adresses en `.test` sont filtrées de toute façon (voir `sendEmail`);
 * ce drapeau couvre le reste, par exemple un jeu de données de démo.
 */
export const emailDisabled = env.EMAIL_DISABLED === 'true'

if (emailDisabled) {
	console.log('Mail disabled (EMAIL_DISABLED=true)')
} else {
	// Signal d'exploitation au démarrage, rien de plus. Un échec ici ne coupe pas les envois:
	// le worker tente sa chance et réessaie, au lieu de se taire pour la vie du processus.
	transporter.verify((err: unknown) => {
		if (err) {
			console.log('Mail config error')
			console.error(err)
		} else console.log('Mail config is ready')
	})
}

type QueuedEmail = {
	options: SendMailOptions
	/**
	 * Capturé dans la requête, à la mise en file: le worker draine hors requête et n'a plus rien
	 * à interroger pour rattacher la ligne de journal.
	 */
	relations: EmailRelations
	attempts: number
}

/** Au-delà, on refuse à l'entrée plutôt que de laisser la mémoire enfler sans borne. */
const MAX_QUEUE_SIZE = 500

const queue: QueuedEmail[] = []
/** Jobs en attente d'un réessai: hors de la file, mais pas encore perdus. */
const retrying = new Set<QueuedEmail>()
let draining: Promise<void> | null = null
let stopped = false

/** Met un message en file et rend la main. Le worker s'en occupe. */
export function enqueueEmail(options: SendMailOptions, relations: EmailRelations = {}) {
	const job: QueuedEmail = { options, relations, attempts: 0 }
	if (stopped) {
		void logFailure(job, new Error('File close'), 'shutdown')
		return
	}
	if (queue.length >= MAX_QUEUE_SIZE) {
		void logFailure(
			job,
			new Error(`File d'attente saturée (${MAX_QUEUE_SIZE} messages)`),
			'overflow'
		)
		return
	}
	queue.push(job)
	void drain()
}

function drain(): Promise<void> {
	if (draining) return draining
	draining = (async () => {
		try {
			while (!stopped) {
				const job = queue.shift()
				if (!job) break
				await runJob(job)
			}
		} finally {
			draining = null
		}
	})()
	return draining
}

async function runJob(job: QueuedEmail) {
	job.attempts++
	try {
		const info = await transporter.sendMail(job.options)
		const rejected = toAddressList(info.rejected)
		await createLog('email_sent', {
			relations: job.relations,
			subject: job.options.subject ?? '',
			to: toAddressList(job.options.to),
			messageId: info.messageId,
			response: info.response,
			rejected: rejected.length ? rejected : undefined,
		})
	} catch (err) {
		if (isPermanentError(err)) return logFailure(job, err, 'permanent')

		const delay = nextDelay(job.attempts)
		if (delay === null) return logFailure(job, err, 'exhausted')
		// `drainEmailQueue` a déjà recensé ce qu'il abandonnait: un réessai inscrit maintenant
		// lui échapperait et le message partirait sans laisser de trace.
		if (stopped) return logFailure(job, err, 'shutdown')

		retrying.add(job)
		const timer = setTimeout(() => {
			retrying.delete(job)
			if (stopped) return
			queue.push(job)
			void drain()
		}, delay)
		// Une minuterie de réessai ne doit jamais retenir le conteneur au redémarrage. Ce qu'elle
		// porte est repris par `drainEmailQueue`, qui le journalise avant que le processus parte.
		timer.unref?.()
	}
}

async function logFailure(job: QueuedEmail, err: unknown, reason: EmailFailureReason) {
	await createLog('email_failed', {
		relations: job.relations,
		subject: job.options.subject ?? '',
		to: toAddressList(job.options.to),
		error: describeError(err),
		attempts: job.attempts,
		reason,
	})
}

function describeError(err: unknown): string {
	if (err instanceof Error) {
		const code = (err as { responseCode?: unknown }).responseCode
		return typeof code === 'number' ? `${code} ${err.message}` : err.message
	}
	return String(err)
}

/**
 * Vide la file avant l'arrêt du serveur, puis journalise ce qui n'a pas pu partir à temps.
 * Après cet appel la file est close: plus rien n'est envoyé.
 */
export async function drainEmailQueue({ timeout = 10_000 } = {}) {
	let guard: ReturnType<typeof setTimeout> | undefined
	await Promise.race([
		drain(),
		new Promise((resolve) => {
			guard = setTimeout(resolve, timeout)
		}),
	])
	// Sans cette annulation, la minuterie retient la boucle d'évènements jusqu'à son terme et
	// chaque arrêt, même immédiat, durerait `timeout`.
	clearTimeout(guard)
	stopped = true

	const abandoned = [...queue.splice(0), ...retrying]
	retrying.clear()
	if (!abandoned.length) return

	console.log(`[email] ${abandoned.length} message(s) abandonné(s) à l'arrêt`)
	for (const job of abandoned) {
		await logFailure(job, new Error('Arrêt du serveur avant envoi'), 'shutdown')
	}
}

/** Un pool ouvert retient la boucle d'évènements: à fermer une fois la file vidée. */
export function closeTransporter() {
	transporter.close()
}
