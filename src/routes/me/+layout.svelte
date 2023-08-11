<script lang="ts">
  import UserLayout from "$lib/me/AuthLayout.svelte";
  export let data
  
</script>

<UserLayout user={data.user}>
  <slot/>
</UserLayout>
