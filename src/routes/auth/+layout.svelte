<script lang="ts">
  import UserLayout from "$lib/UserLayout.svelte";
  export let data
  
</script>

<UserLayout user={data.user}>
  <slot/>
</UserLayout>
