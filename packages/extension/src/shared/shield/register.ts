import { IS_DEV } from "../utils/dev"
import { assignEns } from "./ans"
import {
  register,
  requestEmailAuthentication,
  verifyEmail,
} from "./backend/account"

export const requestEmail = async (email: string) => {
  return requestEmailAuthentication(email)
}

export const confirmEmail = async (code: string) => {
  const { userRegistrationStatus } = await verifyEmail(code)

  // TODO: [BE] make atomic
  if (userRegistrationStatus === "notRegistered") {
    const reservedEns = await assignEns()
    IS_DEV && console.log("assigned ENS:", reservedEns)
    await register()
  }
}
