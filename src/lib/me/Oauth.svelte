<script lang="ts">
	import { mdiGithub } from '@mdi/js'
	import { tip, Icon } from 'fuma'
	import googleLogo from '$lib/assets/google.svg'
</script>

<div class="flex p-4 gap-4 justify-center">
	<a
		href="/auth/google"
		class="btn btn-square"
		data-sveltekit-preload-data="off"
		data-sveltekit-preload-code="off"
		use:tip={{ content: 'Connexion avec Google' }}
	>
		<img src={googleLogo} alt="Logo Google" />
	</a>

	<a
		href="/auth/github"
		class="btn btn-square"
		data-sveltekit-preload-data="off"
		data-sveltekit-preload-code="off"
	>
		<Icon path={mdiGithub} title="Connexion avec Github" />
	</a>
</div>
