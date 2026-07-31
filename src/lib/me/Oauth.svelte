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
	La connexion Github reste désactivée tant qu'on ne sait pas garantir le partage de l'email:
	https://github.com/peufo/benev/issues/136
-->
