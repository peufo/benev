<script lang="ts">
	import { eventPath } from '$lib/store/index.js'
  import EditorJsHTML from 'editorjs-html'

  export let data

  const parser = EditorJsHTML()
  const content = data.page ? JSON.parse(data.page?.content) : null
  const blocksHTML = content ? parser.parse(content) : []

</script>


  <svelte:head>
    <title>{data.page?.title || 'Bienvenu'}</title>
  </svelte:head>


<div class="card bg-neutral mx-auto prose p-6">
    {#each blocksHTML as html}
      {@html html}
    {:else}
      <h2>Salut 👋</h2>
      <p>
        Merci de me faire confiance.<br>
        Tu peux éditer cette page pour accueillir tes bénévoles
        <a href="{$eventPath}/edit/pages{data.page ? `/${data.page.id}` : ''}">en cliquant ici</a>.
      </p>
      
      <p>Jonas</p>


    {/each}
  

</div>



