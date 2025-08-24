const grafanaUrl = import.meta.env.VITE_GRAFANA_URL as string | undefined

export function GrafanaEmbed() {
	if (!grafanaUrl) {
		return <p className="error">Missing Grafana URL. Set VITE_GRAFANA_URL in .env.</p>
	}
	return (
		<div className="grafana-embed">
			<iframe
				src={grafanaUrl}
				title="Grafana"
				width="100%"
				height="900"
				frameBorder="0"
			></iframe>
		</div>
	)
}