import type { Boom } from '@hapi/boom'
import { pingCommand, registerCommand } from '../../commands'
import { CommandManager } from '../command-manager'
import { createWhatsAppSocket } from './socket'
import { DisconnectReason } from 'baileys'

interface ConnectionConfig {
	reconnectInterval?: number
	qrCodeSize?: 'small' | 'medium' | 'large'
}

export class WhatsAppClient {
	private commandManager!: CommandManager
	private readonly config: ConnectionConfig

	constructor(config: ConnectionConfig = {}) {
		this.config = {
			reconnectInterval: 5_000,
			qrCodeSize: 'small',
			...config,
		}
	}

	private handleConnectionClose(error: Boom) {
		const shouldReconnect =
			error.output.statusCode === DisconnectReason.loggedOut

		console.log(
			`❌ Bot desconectado! ${
				shouldReconnect ? 'Tentando reconectar...' : 'Conexão encerrada.'
			}`
		)

		if (shouldReconnect) {
			setTimeout(() => this.initialize(), this.config.reconnectInterval)
		} else {
			console.log('🔑 Faça o Login novamente')
		}
	}

	public async initialize(): Promise<void> {
		try {
			const { socket, saveCreds } = await createWhatsAppSocket()
			this.commandManager = new CommandManager(socket)

			this.commandManager.register(pingCommand(socket))
			this.commandManager.register(registerCommand(socket))

			socket.ev.on('creds.update', saveCreds)

			socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
				if (connection === 'close' && lastDisconnect?.error) {
					this.handleConnectionClose(lastDisconnect.error as Boom)
				} else if (connection === 'open') {
					console.log('✅ Conectado com sucesso!')
				}
			})

			socket.ev.on('messages.upsert', async ({ type, messages }) => {
				if (type !== 'notify') return

				const message = messages[0]

				if (!message.key.remoteJid || !message.message || message.key.fromMe)
					return

				await this.commandManager.handleMessage(message)
			})
		} catch (error) {
			console.error('Erro ao inicializar o cliente do WhatsApp:', error)
			throw error
		}
	}
}
