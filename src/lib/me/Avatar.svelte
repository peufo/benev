<script lang="ts">
	import { User } from '@prisma/client'

	export let user: User
	let klass = ''
	export { klass as class }

	let src = user.avatarId ? `/media/${user.avatarId}/512` : user.avatarPlaceholder
</script>

<img {src} alt="Avatar de l'utilisateur" class={klass} width="512" height="512" />
