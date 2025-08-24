import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { HomePage } from './views/HomePage'
import { RPOCPage } from './views/RPOCPage'
import { GrafanaPage } from './views/GrafanaPage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'rpoc', element: <RPOCPage /> },
			{ path: 'grafana', element: <GrafanaPage /> }
		]
	}
])