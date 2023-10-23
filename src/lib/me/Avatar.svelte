<script lang="ts">
	import { User } from '@prisma/client'

	export let user: User
	let klass = ''
	export { klass as class }
	export let large = false

	$: size = large ? 512 : 256
</script>

{#key user}
	<img
		src={user.avatarId ? `/media/${user.avatarId}/${size}.webp` : user.avatarPlaceholder}
		alt="Avatar de l'utilisateur"
		class="{klass} h-full w-full"
		style="margin: 0 !important;"
		width={size}
		height={size}
	/>
{/key}
