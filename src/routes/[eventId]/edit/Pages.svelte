<script lang="ts">
	import type { Page } from '@prisma/client'
	import { mdiPlus } from '@mdi/js'

	import { urlParam } from '$lib/store'
	import { Icon } from '$lib/material'
  import PageForm from './PageForm.svelte';

	export let pages: Page[]
</script>

<div class="card bg-base-100">
	<div class="card-body">
		<h3 class="font-bold text-lg">Édition des pages</h3>

    <div class="flex gap-2">
      <div>

        <ul class="menu menu-lg bg-base-200 w-56 rounded-box mt-2">
          {#each pages as page}
            <li>
              <a
                href={$urlParam.with({ page: page.id })}
                class:active={$urlParam.hasValue('page', page.id)}
              >
                {page.title}
              </a>
            </li>
          {/each}
        </ul>

        <button class="btn w-full mt-2">
          <Icon path={mdiPlus}/>
          Nouvel page
        </button>


      </div>

      <PageForm />


    </div>



	</div>
</div>
