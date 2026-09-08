<script lang="ts">
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>h64-scan</title>
</svelte:head>

{@render children()}

<a href="https://www.flaticon.com/free-icons/scanner" title="scanner icons">Favicon icon created by Vectors Tank - Flaticon</a>