<script lang="ts">
	import { Media, User } from '@prisma/client'

	export let user: User & { avatar: Media | null }
	let klass = ''
	export { klass as class }
</script>

<img
	src={user.avatar?.path || user.avatarPlaceholder}
	alt="Avatar de l'utilisateur"
	class={klass}
/>
