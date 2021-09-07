import { Injectable, Logger, Scope } from '@nestjs/common'
import { typesChain } from '@phala/typedefs'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { IPolkadotIngestorDataSource } from '.'
import { BlockHeightStorage } from '../../storage/blockHeight'

@Injectable({ scope: Scope.TRANSIENT })
export class PolkadotIngestor {
    private readonly logger = new Logger(PolkadotIngestor.name)

    private unsubscribe?: () => void

    constructor(private readonly blockHeight: BlockHeightStorage) {}

    public async start(config: IPolkadotIngestorDataSource) {
        const { endpoint, name } = config

        const api = await ApiPromise.create({
            provider: new WsProvider(endpoint),
            typesChain,
        })
        await cryptoWaitReady()

        const chain = (await api.rpc.system.chain()).toString()

        this.unsubscribe = await api.query.system.number((number) => {
            this.blockHeight.write({
                chain,
                height: number.toBigInt(),
                name,
            })
            this.logger.debug(`written last-known block, name=${name}, height=${number.toString()}`)
        })
    }

    public stop() {
        this.unsubscribe?.()
    }
}
