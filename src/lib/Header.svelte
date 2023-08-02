<script lang="ts">
	import { mdiAccountOutline } from '@mdi/js'
	import { page } from '$app/stores'
	import Icon from '$lib/material/Icon.svelte'

	export let userName = ''

	// TODO use event pages
	export let pages: [string, string][] = [
		['/home', 'Bienvenu'],
    ['/teams', 'Équipes'],
		['/regle', 'Règlement'],
		['/faq', 'FAQ'],
	]
</script>

<header class="navbar rounded-2xl bg-base-100 shadow-xl">
  <div class="navbar-start">
    <a class="btn-ghost btn text-xl" href="/">BENEV</a>
    <slot/>
  </div>
  <div class="navbar-end gap-2">
    <div class="tabs">
      {#each pages as [href, label]}
        <a class="tab tab-bordered" {href} class:tab-active={$page.route.id === href}>
          {label}
        </a>
      {/each}
    </div>

    <a class="btn-ghost rounded-btn btn" href="/auth">
      <Icon path={mdiAccountOutline} />
      {userName || ''}
    </a>
  
  </div>
</header>