<script lang="ts">
  import EditorJsHTML from 'editorjs-html'

  export let data

  const parser = EditorJsHTML()

  const content = data.page ? JSON.parse(data.page?.content) : {}
  const blocksHTML = parser.parse(content)



</script>

<div class="card bg-neutral mx-auto prose p-6">
  
    {#each blocksHTML as html}
      {@html html}
    {/each}
  

</div>



