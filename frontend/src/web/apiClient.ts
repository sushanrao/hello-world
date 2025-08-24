import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

export const http = axios.create({ baseURL, timeout: 10000 })

export type SubmitRpocPayload = {
	deviceId: string
	parameterA: number
	parameterB: number
	notes?: string
}

export async function submitRpoc(payload: SubmitRpocPayload): Promise<void> {
	await http.post('/edge/rpoc', payload)
}