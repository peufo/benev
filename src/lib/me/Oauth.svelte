<script lang="ts">
	import { resolve } from '$app/paths'
	import googleLogo from '$lib/assets/google.svg'
</script>

<!--
	Navigation native obligatoire: /auth/google n'est qu'un endpoint, donc absent du manifest
	client. Le routeur ferait matcher l'URL sur /[eventId]/[pagePath] et rendrait un 404.
	Au passage, ça coupe aussi le préchargement: survoler ne doit pas déclencher le flux OAuth.
-->
<a href={resolve('/auth/google')} class="btn w-full border-soft" data-sveltekit-reload>
	<img src={googleLogo} alt="" width="18" height="18" aria-hidden="true" />
	<span>Continuer avec Google</span>
</a>

<!--
	La connexion Github reste désactivée tant qu'on ne sait pas garantir le partage de l'email:
	https://github.com/peufo/benev/issues/136
-->
