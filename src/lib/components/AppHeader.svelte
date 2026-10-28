<script lang="ts">
	import { catalog } from '../catalog';
	import logo from '../assets/favicon.svg';
</script>

<header>
	<div class="brand">
		<img class="logo" src={logo} alt="" width="40" height="40" />
		<span class="wordmark">
			<span class="name">{catalog.model.abbrev}</span>
			<span class="sub">Zero Trust Maturity & Transformation Model</span>
		</span>
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 0;
		border-bottom: 1px solid var(--border);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.logo {
		width: 40px;
		height: 40px;
		display: block;
		flex: none;
	}
	.wordmark {
		display: flex;
		flex-direction: column;
	}
	.name {
		font-weight: 700;
		font-size: 18px;
		letter-spacing: -0.01em;
	}
	.sub {
		font-size: 12px;
		color: var(--muted);
	}
</style>