import type { proto } from '@whiskeysockets/baileys'
import type { Command } from '../../@types/command'
import type { Socket } from '../../@types/socket'

export class CommandManager {
	private commands: Map<string, Command>
	private prefix: string
	private socket: Socket

	constructor(socket: Socket, prefix = '!') {
		this.commands = new Map()
		this.prefix = prefix
		this.socket = socket
	}

	register(command: Command) {
		this.commands.set(command.name, command)
	}

	async handleMessage(message: proto.IWebMessageInfo) {
		const content =
			message.message?.conversation ||
			message.message?.extendedTextMessage?.text ||
			''

		if (!content.startsWith(this.prefix)) return

		const [commandName, ...args] = content.slice(this.prefix.length).split(' ')
		const command = this.commands.get(commandName)

		if (command) {
			try {
				await command.execute(message, args)
			} catch (error) {
				console.error(`Erro ao executar o comando ${commandName}:`, error)
			}
		}
	}
}
