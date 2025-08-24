import { useState } from 'react'
import { z } from 'zod'
import { submitRpoc } from '../web/apiClient'

const rpocSchema = z.object({
	deviceId: z.string().min(1, 'Device ID is required'),
	parameterA: z.coerce.number().min(0).max(1000),
	parameterB: z.coerce.number().min(0).max(1000),
	notes: z.string().max(256).optional().or(z.literal(''))
})

type RPOCInput = z.infer<typeof rpocSchema>

export function RPOCPage() {
	const [form, setForm] = useState<RPOCInput>({ deviceId: '', parameterA: 0, parameterB: 0, notes: '' })
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setSuccess(null)
		const parsed = rpocSchema.safeParse(form)
		if (!parsed.success) {
			setError(parsed.error.errors[0]?.message ?? 'Invalid input')
			return
		}
		setSubmitting(true)
		try {
			await submitRpoc(parsed.data)
			setSuccess('Submitted to edge gateway')
		} catch (err: any) {
			setError(err?.message ?? 'Submission failed')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section>
			<h1>RPOC Parameters</h1>
			<form onSubmit={handleSubmit} className="form">
				<label>
					<span>Device ID</span>
					<input
						type="text"
						value={form.deviceId}
						onChange={e => setForm({ ...form, deviceId: e.target.value })}
						placeholder="edge-001"
					/>
				</label>
				<div className="row">
					<label>
						<span>Parameter A</span>
						<input
							type="number"
							value={form.parameterA}
							onChange={e => setForm({ ...form, parameterA: Number(e.target.value) })}
							step="0.1"
						/>
					</label>
					<label>
						<span>Parameter B</span>
						<input
							type="number"
							value={form.parameterB}
							onChange={e => setForm({ ...form, parameterB: Number(e.target.value) })}
							step="0.1"
						/>
					</label>
				</div>
				<label>
					<span>Notes</span>
					<textarea
						value={form.notes}
						onChange={e => setForm({ ...form, notes: e.target.value })}
						rows={3}
					/>
				</label>
				<div className="actions">
					<button type="submit" disabled={submitting}>Submit</button>
				</div>
				{error && <p className="error">{error}</p>}
				{success && <p className="success">{success}</p>}
			</form>
		</section>
	)
}