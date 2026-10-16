export type PosterEvent = {
	name: string
	posterId: string
	/** Membres validés, la même mesure que les quotas des paliers. */
	members: number
	/** Somme des créneaux acceptés, arrondie à l'heure. */
	hours: number
}
