import { Link, NavLink, Outlet } from 'react-router-dom'

export function AppLayout() {
	return (
		<div className="app">
			<header className="header">
				<Link to="/" className="logo">Edge → Cloud</Link>
				<nav className="nav">
					<NavLink to="/" end>Home</NavLink>
					<NavLink to="/rpoc">RPOC</NavLink>
					<NavLink to="/grafana">Grafana</NavLink>
				</nav>
			</header>
			<main className="main">
				<Outlet />
			</main>
		</div>
	)
}