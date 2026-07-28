/**
 * Lien de carte universel: le site sur desktop, l'app native sur Android et iOS.
 * Les coordonnées pointent le lieu exact; à défaut on retombe sur une recherche
 * textuelle, forcément approximative mais honnête sur son imprécision.
 */
export const mapUrl = ({ label, coords }: PrismaJson.Location) =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
		coords ? `${coords.lat},${coords.lon}` : label
	)}`
