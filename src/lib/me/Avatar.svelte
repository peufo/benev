<script lang="ts">
	import type { User } from '@prisma/client'

	export let user: User
	let klass = ''
	export { klass as class }
	export let size: 'medium' | 'large' = 'medium'
</script>

{#key user}
	<img
		src={user.avatarId ? `/media/${user.avatarId}?size=${size}` : user.avatarPlaceholder}
		alt="Avatar de l'utilisateur"
		class={klass}
		style="margin: 0 !important;"
	/>
{/key}
