<script lang="ts">
	import { mdiAccountOutline } from '@mdi/js'
	import Icon from '$lib/material/Icon.svelte'

	export let userName = ''


</script>

<header class="navbar rounded-2xl bg-base-100 shadow-xl">
  <div class="navbar-start">
    <a class="btn-ghost btn text-xl" href="/">BENEV</a>
    <slot name="start"/>
  </div>
  <div class="navbar-end gap-2">
    <slot name="end"/>

    <a class="btn-ghost rounded-btn btn" href="/auth">
      <Icon path={mdiAccountOutline} />
      {userName || ''}
    </a>
  
  </div>
</header>