import { error, json } from '@sveltejs/kit'

export const GET = async ({ url }) => {
	const address = url.searchParams.get('address')
	if (typeof address !== 'string') error(400, 'query "address" is required')
	const res = await fetch(address).then((res) => res.text())
	const reg = /<meta content="([^"]+)" property="og:title">/
	const [, addressLabel] = res.match(reg) || []
	return json({ addressLabel })
}
