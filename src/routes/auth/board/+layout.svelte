
<script lang="ts">
	import { page } from "$app/stores"
  
  const tabs = [
    {path: 'subscribes', label: 'Mes inscriptions'},
    {path: 'profile', label: 'Profil'},
    {path: 'logout', label: 'Déconnexion'}
  ]

</script>

  <div class="card bg-base-100 max-w-4xl mx-auto">

    <div class="card-body flex flex-wrap flex-row gap-4">

      <ul class="menu menu-lg bg-base-200 w-56 rounded-box text-clip">
        {#each tabs as {path, label}}
          {@const href = `/auth/board/${path}`}
          <li>
            <a {href} class:active={$page.url.pathname === href}>
              {label}
            </a>
          </li>
        {/each}
      </ul>
      <div class="grow">
        <slot />
      </div>
    </div>
  
  
  </div>

