export function createAvatarPlaceholder() {
	const avatarUrl = new URL('https://api.dicebear.com/7.x/thumbs/svg')
	avatarUrl.searchParams.append('seed', String(Math.random()))
	return avatarUrl.toString()
}
