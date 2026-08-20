const PRODUCTION_HOSTNAME = 'benev.io'

const productionRules = `User-agent: *
Allow: /

# Surface applicative : rien d'indexable, autant préserver le budget de crawl
Disallow: /auth
Disallow: /me
Disallow: /root
Disallow: /lab
Disallow: /api/
Disallow: /*/admin
Disallow: /*/api/
Disallow: /*/me
Disallow: /*/register
Disallow: /*/subscribes

# /media/ reste ouvert : Googlebot-Image doit récupérer les affiches d'évènement
`

export function GET({ url }) {
	// Les environnements de pré-production servent le même contenu que la production:
	// indexables, ils en deviendraient un duplicata intégral.
	if (url.hostname !== PRODUCTION_HOSTNAME) return robots('User-agent: *\nDisallow: /\n')

	return robots(`${productionRules}\nSitemap: ${url.origin}/sitemap.xml\n`)
}

function robots(body: string) {
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
