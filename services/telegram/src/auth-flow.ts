import type { TelegramAuthHandlers } from '@telegram-drive/types'
import { AppError, toSafeError } from './errors'

const MAX_ATTEMPTS = 5

export interface AuthorizationStateUpdate {
  _: string
  password_hint?: string
  link?: string
  codeType?: string
}

export type Invoke = (request: Record<string, unknown>) => Promise<unknown>

export type AuthStepResult = 'ready' | 'closed' | 'pending'

export function toAuthorizationUpdate(state: { _: string }): AuthorizationStateUpdate {
  const record = state as {
    password_hint?: unknown
    link?: unknown
    code_info?: { type?: { _?: unknown } }
  }
  return {
    _: state._,
    password_hint: typeof record.password_hint === 'string' ? record.password_hint : undefined,
    link: typeof record.link === 'string' ? record.link : undefined,
    codeType: typeof record.code_info?.type?._ === 'string' ? record.code_info.type._ : undefined,
  }
}

export function codeDeliveryLabel(state: AuthorizationStateUpdate): string {
  switch (state.codeType) {
    case 'authenticationCodeTypeTelegramMessage':
      return 'a Telegram message'
    case 'authenticationCodeTypeSms':
      return 'SMS'
    case 'authenticationCodeTypeSmsWord':
      return 'an SMS word'
    case 'authenticationCodeTypeSmsPhrase':
      return 'an SMS phrase'
    case 'authenticationCodeTypeCall':
      return 'a phone call'
    case 'authenticationCodeTypeFlashCall':
      return 'a flash call'
    case 'authenticationCodeTypeMissedCall':
      return 'a missed call'
    case 'authenticationCodeTypeFragment':
      return 'Fragment'
    default:
      return 'Telegram'
  }
}

function normalizePhone(input: string): string {
  return input.replace(/[\s()-]/g, '')
}

/**
 * Responds to one TDLib authorization state using the official methods.
 * setTdlibParameters is sent by the TDLib client from configured options,
 * so this function only records that state and waits for the next one.
 */
export async function respondToAuthorizationState(
  state: AuthorizationStateUpdate,
  handlers: TelegramAuthHandlers,
  invoke: Invoke,
): Promise<AuthStepResult> {
  switch (state._) {
    case 'authorizationStateWaitTdlibParameters':
    case 'authorizationStateWaitEncryptionKey':
    case 'authorizationStateLoggingOut':
    case 'authorizationStateClosing':
      return 'pending'

    case 'authorizationStateReady':
      return 'ready'

    case 'authorizationStateClosed':
      return 'closed'

    case 'authorizationStateWaitPhoneNumber':
      await submitWithRetries(async (retry) => {
        const phoneNumber = normalizePhone(await handlers.getPhoneNumber(retry))
        if (!/^\+[1-9]\d{6,14}$/.test(phoneNumber)) {
          throw new AppError('PHONE_NUMBER_INVALID', 'That phone number was not accepted. Use international format.')
        }
        await invoke({
          _: 'setAuthenticationPhoneNumber',
          phone_number: phoneNumber,
          settings: null,
        })
      })
      return 'pending'

    case 'authorizationStateWaitEmailAddress':
      await submitWithRetries(async (retry) => {
        const emailAddress = (await handlers.getEmailAddress(retry)).trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
          throw new AppError('EMAIL_ADDRESS_INVALID', 'That email address was not accepted.')
        }
        await invoke({
          _: 'setAuthenticationEmailAddress',
          email_address: emailAddress,
        })
      })
      return 'pending'

    case 'authorizationStateWaitEmailCode':
      await submitWithRetries(async (retry) => {
        const code = (await handlers.getEmailCode(retry)).trim()
        if (code.length < 3 || code.length > 64) {
          throw new AppError('EMAIL_CODE_INVALID', 'The email code was not accepted.')
        }
        await invoke({
          _: 'checkAuthenticationEmailCode',
          code: {
            _: 'emailAddressAuthenticationCode',
            code,
          },
        })
      })
      return 'pending'

    case 'authorizationStateWaitCode':
      await submitWithRetries(async (retry) => {
        const code = (await handlers.getAuthCode({
          retry,
          delivery: codeDeliveryLabel(state),
        })).trim()
        if (code.length < 3 || code.length > 64) {
          throw new AppError('PHONE_CODE_INVALID', 'The code is incorrect. Try again.')
        }
        await invoke({
          _: 'checkAuthenticationCode',
          code,
        })
      })
      return 'pending'

    case 'authorizationStateWaitPassword':
      await submitWithRetries(async (retry) => {
        const password = await handlers.getPassword(state.password_hint ?? '', retry)
        if (password.length === 0 || password.length > 256) {
          throw new AppError('PASSWORD_HASH_INVALID', 'The password was not accepted.')
        }
        await invoke({
          _: 'checkAuthenticationPassword',
          password,
        })
      })
      return 'pending'

    case 'authorizationStateWaitOtherDeviceConfirmation':
      handlers.confirmOnAnotherDevice(state.link ?? '')
      return 'pending'

    case 'authorizationStateWaitRegistration':
      {
        const name = await handlers.getRegistrationName()
        const firstName = name.firstName.trim()
        const lastName = name.lastName.trim()
        if (firstName.length < 1 || firstName.length > 64 || lastName.length > 64) {
          throw new AppError('REGISTRATION_INVALID', 'The name was not accepted.')
        }
        await invoke({
          _: 'registerUser',
          first_name: firstName,
          last_name: lastName,
          disable_notification: false,
        })
      }
      return 'pending'

    case 'authorizationStateWaitPremiumPurchase':
      throw new AppError(
        'AUTH_PREMIUM_REQUIRED',
        'Telegram requires a Premium purchase before this account can sign in. Complete that in the official Telegram app, then try again.',
      )

    default:
      throw new AppError(
        'UNSUPPORTED_AUTH_STATE',
        'Telegram returned an authorization state this version does not handle yet.',
      )
  }
}

async function submitWithRetries(attempt: (retry: boolean) => Promise<void>): Promise<void> {
  let retry = false
  for (let count = 0; count < MAX_ATTEMPTS; count += 1) {
    try {
      await attempt(retry)
      return
    } catch (error) {
      const safe = toSafeError(error)
      if (!isRetryable(safe.code) || count === MAX_ATTEMPTS - 1) throw safe
      retry = true
    }
  }
}

function isRetryable(code: string): boolean {
  return (
    code === 'PHONE_NUMBER_INVALID' ||
    code === 'PHONE_CODE_INVALID' ||
    code === 'PHONE_CODE_EMPTY' ||
    code === 'EMAIL_ADDRESS_INVALID' ||
    code === 'EMAIL_CODE_INVALID' ||
    code === 'PASSWORD_HASH_INVALID'
  )
}

export function isBenignAuthWait(state: string | undefined): boolean {
  return state === 'authorizationStateWaitTdlibParameters' || state === 'authorizationStateWaitEncryptionKey'
}
