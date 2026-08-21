/**
 * Motif de l'échec d'un envoi, tel que le worker d'emails le constate.
 * - `permanent`: le relais a répondu en 5xx, réessayer répéterait le même refus.
 * - `exhausted`: erreur passagère, mais toutes les tentatives ont été consommées.
 * - `shutdown`: le serveur s'est arrêté avant que la file soit vidée.
 * - `overflow`: la file avait atteint son plafond, le message a été refusé à l'entrée.
 */
export type EmailFailureReason = 'permanent' | 'exhausted' | 'shutdown' | 'overflow'

/**
 * Charge utile de chaque type de journal.
 *
 * `LogType` côté Prisma déclare le vocabulaire; cette table déclare ce qui est réellement écrit.
 * `createLog` étant générique sur ses clés, ajouter un type de journal oblige à décrire sa charge
 * utile avant de pouvoir l'écrire.
 */
export type LogDataMap = {
	email_sent: {
		subject: string
		to: string[]
		messageId: string
		/** Réponse du relais à la soumission. Ne dit rien de la livraison finale. */
		response: string
		/** Destinataires refusés au RCPT TO alors que d'autres passaient: envoi partiel. */
		rejected?: string[]
	}
	email_failed: {
		subject: string
		to: string[]
		error: string
		attempts: number
		reason: EmailFailureReason
	}
}

export type LogDataType = keyof LogDataMap
