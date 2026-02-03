import path from 'path'

export async function scrapIcon(site: string): Promise<string | null> {
	try {
		const html = await fetch(site).then((r) => r.text())
		const reg = /<link rel="icon" href="([^"]*)/
		const [, href] = html.match(reg) || []
		if (!href) throw 'logo no found'

		if (href.startsWith('data:')) return href

		const icon = 'https://' + path.join(site.replace(/https+:\/\//, ''), href.replace(site, ''))
		const res = await fetch(icon)
		if (!res.ok) throw 'logo not valid'
		return icon
	} catch (err) {
		return null
	}
}
