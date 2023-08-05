<script lang="ts">
	import TeamForm from '../../TeamForm.svelte'

  export let data

</script>

<div class="card p-4 bg-base-100 m-auto max-w-md">
	<TeamForm isUpdate team={data.team}/>
</div>
