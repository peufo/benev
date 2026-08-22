import type { LogType, Prisma } from '@prisma/client'
import { logMap, type LogData, type LogInput } from '$lib/log/logMap'
import { LOG_FAMILIES, LOG_TYPES_FOR_EVENT, type LogFamily } from '$lib/log/logLabels'
import type { LogOutput } from '$lib/log/logTypes'
import { prisma } from './prisma'

/**
 * Écrit une ligne dans le journal.
 *
 * La transformation dérive les relations depuis ce que la mutation vient d'écrire: le point
 * d'appel passe l'entité, pas ses clés étrangères.
 *
 * N'échoue jamais bruyamment: un journal qui tombe ne doit pas emporter ce qu'il journalise.
 * Le worker d'emails l'appelle notamment depuis son chemin d'erreur, où lever une seconde fois
 * ferait perdre la trace de la première.
 */
export async function createLog<T extends LogType>(type: T, input: LogInput<T>): Promise<void> {
	try {
		// `logMap[type]` est une union de toutes les transformations: TypeScript en intersecte les
		// paramètres et n'accepte plus rien. Le lien type -> entrée est déjà vérifié par la
		// signature, ce cast le rétablit à l'intérieur.
		const transform = logMap[type] as (input: LogInput<T>) => LogOutput<LogData<T>>
		const { data, ...relations } = transform(input)
		// Le générique est résolu ici, pas dans l'appel: les types conditionnels de
		// `LogCreateArgs` ne savent pas trancher un `T` encore ouvert. Les colonnes sont énumérées
		// pour la même raison — et parce que c'est la liste de ce qu'une transformation peut poser.
		const logType: LogType = type
		const payload: PrismaJson.JsonLogData = data
		await prisma.log.create({
			data: {
				type: logType,
				data: payload,
				eventId: relations.eventId ?? null,
				memberId: relations.memberId ?? null,
				teamId: relations.teamId ?? null,
				userId: relations.userId ?? null,
				createdById: relations.createdById ?? null,
			},
		})
	} catch (err) {
		console.error(`[log] écriture impossible (${type})`, err)
	}
}

export type LogWithEvent = Prisma.LogGetPayload<{
	include: { event: { select: { id: true; name: true } } }
}>

export type LogFilter = {
	eventId: string
	family?: LogFamily
	memberId?: string
	teamId?: string
}

/**
 * Le filtre du fil d'un évènement, partagé par le `load` de la page et par la requête qui charge
 * les entrées précédentes: les deux doivent voir exactement le même ensemble, sans quoi le bouton
 * ferait apparaître des lignes que le filtre courant exclut.
 */
export function eventLogsWhere({
	eventId,
	family,
	memberId,
	teamId,
}: LogFilter): Prisma.LogWhereInput {
	return {
		eventId,
		// `email_sent` est écrit pour chaque notification: le montrer ici noierait tout le reste.
		// `LOG_TYPES_FOR_EVENT` ne retient que l'échec, seul utile à l'organisateur.
		type: { in: family ? [...LOG_FAMILIES[family].types] : LOG_TYPES_FOR_EVENT },
		...(memberId && { memberId }),
		...(teamId && { teamId }),
	}
}

/**
 * Une fenêtre du fil, rendue du plus ancien au plus récent — c'est dans cet ordre qu'il se lit,
 * la dernière entrée en bas.
 *
 * La requête, elle, part de la fin: `beforeId` remonte vers le passé, ce que fait le bouton
 * « charger les entrées précédentes ». Une ligne de plus est demandée que nécessaire, pour savoir
 * s'il reste quelque chose au-dessus sans avoir à compter la table.
 *
 * Un seul `include`, et seulement pour l'affichage inter-évènement de `/root/logs`: tout ce que
 * le fil montre est figé dans `data`, il n'y a aucune jointure à faire pour le rendre.
 */
export async function getLogs(
	where: Prisma.LogWhereInput,
	{ take = 30, beforeId }: { take?: number; beforeId?: string } = {}
): Promise<{ logs: LogWithEvent[]; hasMore: boolean }> {
	const rows = await prisma.log.findMany({
		where,
		// `id` en second critère: deux lignes peuvent partager la milliseconde, et un curseur posé
		// sur un ordre non total sauterait ou répéterait des entrées.
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		take: take + 1,
		...(beforeId && { cursor: { id: beforeId }, skip: 1 }),
		include: { event: { select: { id: true, name: true } } },
	})
	return { logs: rows.slice(0, take).reverse(), hasMore: rows.length > take }
}
