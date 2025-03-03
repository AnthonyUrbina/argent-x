import { useCallback } from "react"
import { Call } from "starknet"

import { ARGENT_TRANSACTION_SIMULATION_API_ENABLED } from "./../../../../shared/api/constants"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../../shared/storage/hooks"
import { fetchTransactionSimulation } from "../../../../shared/transactionSimulation/transactionSimulation.service"
import { ApiTransactionSimulationResponse } from "../../../../shared/transactionSimulation/types"
import { argentApiFetcher } from "../../../services/argentApiFetcher"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { Account } from "../../accounts/Account"

export interface IUseTransactionSimulation {
  account?: Account
  transactions: Call | Call[]
  actionHash: string
}

export const useTransactionSimulationEnabled = () => {
  const privacyUseArgentServicesEnabled = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )

  // const TRANSACTION_SIMULATION_ENABLED =
  //   process.env.FEATURE_TRANSACTION_SIMULATION === "true"

  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_TRANSACTION_SIMULATION_API_ENABLED
  }
  return (
    ARGENT_TRANSACTION_SIMULATION_API_ENABLED && privacyUseArgentServicesEnabled
  )
}

export const useTransactionSimulation = ({
  account,
  transactions,
  actionHash,
}: IUseTransactionSimulation) => {
  const transactionSimulationEnabled = useTransactionSimulationEnabled()
  const transactionSimulationFetcher = useCallback(async () => {
    if (!account || account.needsDeploy) {
      // TODO: handle account deployment
      return
    }
    return fetchTransactionSimulation({
      transactions,
      fetcher: argentApiFetcher,
    })
  }, [account, transactions]) // eslint-disable-line react-hooks/exhaustive-deps
  return useConditionallyEnabledSWR<ApiTransactionSimulationResponse>(
    Boolean(transactionSimulationEnabled),
    [actionHash, "transactionSimulation"],
    transactionSimulationFetcher,
    {
      revalidateOnFocus: false,
    },
  )
}
