<script lang="ts">
	import { mdiGithub } from '@mdi/js'
	import { tip, Icon } from 'fuma'
	import googleLogo from '$lib/assets/google.svg'
</script>

<div class="flex p-4 gap-4 justify-center">
	<a
		href="/auth/google"
		class="btn lowercase"
		data-sveltekit-preload-data="off"
		data-sveltekit-preload-code="off"
	>
		<img src={googleLogo} alt="Logo Google" />
		<span>Connexion avec Google</span>
	</a>
	<!-- 
		TODO: ensure user share his email 
	 	https://github.com/peufo/benev/issues/136

		<a
			href="/auth/github"
			class="btn btn-square"
			data-sveltekit-preload-data="off"
			data-sveltekit-preload-code="off"
		>
			<Icon path={mdiGithub} title="Connexion avec Github" />
		</a>
	-->
</div>
