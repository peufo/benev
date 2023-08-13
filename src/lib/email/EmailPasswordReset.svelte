<script lang="ts">
  import {dev} from '$app/environment'

  export let tokenId: string
  const  domain = dev ? 'http://localhost:5173' : 'https://benev.ch'

</script>

<h1>
  Changement de mot de passe
</h1>

<p>
  Tu peux changer ton mot de passe en 
  <a href="{domain}/token/{tokenId}/reset_password" data-sveltekit-preload-data="off">
    cliquant sur ce lien.
  </a>
</p>
