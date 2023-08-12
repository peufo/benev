<script lang="ts">
  import {dev} from '$app/environment'

  export let isNewUser = false
  export let tokenId: string
  const  domain = dev ? 'http://localhost:5173' : 'https://benev.ch'

</script>

<h1>
  {isNewUser ? 'Bienvenu sur benev.ch': 'Verification de ton adresse mail'}
</h1>

<p>
  Tu peux valider ton adresse email en 
  <a href="{domain}/email-check/{tokenId}" data-sveltekit-preload-data="off">
    cliquant sur ce lien.
  </a>
</p>