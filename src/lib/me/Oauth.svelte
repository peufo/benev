<script lang="ts">
	import googleLogo from '$lib/assets/google.svg'
</script>

<!-- Préchargement coupé: survoler ne doit pas déclencher le flux OAuth. -->
<a
	href="/auth/google"
	class="btn w-full border-soft"
	data-sveltekit-preload-data="off"
	data-sveltekit-preload-code="off"
>
	<img src={googleLogo} alt="" width="18" height="18" aria-hidden="true" />
	<span>Continuer avec Google</span>
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
