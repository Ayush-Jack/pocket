import readline from 'node:readline'
import type { AuthCodePrompt, TelegramAuthHandlers } from '@telegram-drive/types'

export function createConsoleAuthHandlers(): TelegramAuthHandlers {
  return {
    getPhoneNumber: (retry) =>
      ask(`${retry ? 'That phone number was not accepted. ' : ''}Phone number in international format: `),
    getAuthCode: (prompt: AuthCodePrompt) =>
      ask(
        `${prompt.retry ? 'That code was not accepted. ' : ''}Enter the code from ${prompt.delivery}: `,
      ),
    getPassword: (passwordHint, retry) => {
      const hint = passwordHint ? ` (hint: ${passwordHint})` : ''
      const prefix = retry ? 'That password was not accepted. ' : ''
      return askHidden(`${prefix}Telegram password${hint}: `)
    },
    getEmailAddress: (retry) =>
      ask(`${retry ? 'That email address was not accepted. ' : ''}Email address: `),
    getEmailCode: (retry) =>
      ask(`${retry ? 'That email code was not accepted. ' : ''}Email code: `),
    getRegistrationName: async () => ({
      firstName: await ask('First name: '),
      lastName: await ask('Last name (optional): '),
    }),
    confirmOnAnotherDevice: (link) => {
      process.stdout.write(
        'Confirm this login in an already signed-in Telegram app. The link is shown here and is not written to the log.\n',
      )
      if (link) process.stdout.write(`${link}\n`)
    },
  }
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function askHidden(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  const onData = (chunk: Buffer) => {
    const text = chunk.toString('utf8')
    if (text.includes('\n') || text.includes('\r')) return
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(question)
  }
  process.stdin.on('data', onData)
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      process.stdin.off('data', onData)
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}
