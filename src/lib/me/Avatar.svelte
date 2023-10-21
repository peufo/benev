<script lang="ts">
	import { User } from '@prisma/client'

	export let user: User
	let klass = ''
	export { klass as class }
	export let large = false
</script>

{#key user}
	<img
		src={user.avatarId
			? `/media/${user.avatarId}/${large ? 512 : 256}.webp`
			: user.avatarPlaceholder}
		alt="Avatar de l'utilisateur"
		class={klass}
		width="512"
		height="512"
	/>
{/key}
