import { makeWASocket, useMultiFileAuthState } from 'baileys'
import P from 'pino'

const logger = P({ level: 'silent' })

const createWhatsAppSocket = async () => {
	try {
		const { state, saveCreds } = await useMultiFileAuthState('auth_baileys')

		const socket = makeWASocket({
			auth: state,
			printQRInTerminal: true,
			logger,
		})

		return {
			socket,
			saveCreds,
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Error occurred while initializing WhatsApp socket: ${error.message}`
			)
		}

		throw new Error(
			'Unexpected error occurred while initializing WhatsApp socket!'
		)
	}
}

export { createWhatsAppSocket }
