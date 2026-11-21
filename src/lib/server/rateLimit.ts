interface RateLimitOptions {
	windowMs: number
	/** Nombre d'occurrences tolérées à l'intérieur de la fenêtre. */
	max: number
	/** Au-delà, la carte est vidée: sans cette borne, une clé par visiteur s'y accumulerait. */
	maxEntries?: number
}

/**
 * Fenêtre glissante tenue en mémoire du processus — suffisant pour un déploiement à instance
 * unique, à revoir s'il en naît une seconde.
 *
 * Le choix de la clé appartient à l'appelant, et il n'est pas anodin: sur un flux qui doit taire
 * l'existence d'un compte, appeler ce garde *après* la lecture en base ferait de la limite un
 * révélateur.
 *
 * À importer d'ici, jamais du barrel `#lib/server`: la fabrique s'appelle à l'évaluation du module,
 * or le barrel participe à un cycle (`server/team` → `#lib/period` → `#lib/me` → `user.remote`) qui
 * la laisse à `undefined` selon le point d'entrée. Les autres exports du barrel n'y sont pas exposés
 * parce qu'ils ne sont lus que dans des corps de fonction.
 */
export function createRateLimit({ windowMs, max, maxEntries = 10_000 }: RateLimitOptions) {
	const hits = new Map<string, number[]>()

	function isRateLimited(key: string) {
		const now = Date.now()
		const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs)
		if (recent.length >= max) return true
		if (hits.size > maxEntries) hits.clear()
		hits.set(key, [...recent, now])
		return false
	}

	/**
	 * Rend la place d'un geste que la limite a laissé passer mais qui n'a pas eu lieu, comme un
	 * e-mail que la file a refusé: le compter priverait l'appelant d'un envoi qu'il n'a pas fait.
	 */
	function refund(key: string) {
		hits.get(key)?.pop()
	}

	return Object.assign(isRateLimited, { refund })
}
