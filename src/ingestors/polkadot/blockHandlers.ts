import { Injectable, Scope } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { typesChain } from '@phala/typedefs'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { IPolkadotIngestorDataSource } from '.'
import { BlockWorkerStatHandler } from './topics/workerStats/handler'

@Injectable({ scope: Scope.TRANSIENT })
export class PolkadotBlockIngestor {
    constructor(private readonly moduleRef: ModuleRef) {}

    public async start({ endpoint, name }: IPolkadotIngestorDataSource): Promise<void> {
        const api = await ApiPromise.create({ provider: new WsProvider(endpoint), typesChain })

        const chain = (await api.rpc.system.chain()).toString()

        const workerStatHandler = await this.moduleRef.resolve(BlockWorkerStatHandler)

        for (let i = 4000; i < 4100; i++) {
            const blockNumber = api.createType('BlockNumber', i)
            await workerStatHandler.importAt(blockNumber, api, chain, name)
        }
    }

    public stop(): Promise<void> {
        throw new Error('method not implemented')
    }
}

@Injectable()
export class PolkadotBlockIngestorRoot {
    private readonly ingestors: PolkadotBlockIngestor[] = []

    constructor(private readonly moduleRef: ModuleRef) {}

    public async start(configs: IPolkadotIngestorDataSource[]): Promise<void> {
        const newIngestors = configs.map((config) =>
            (async () => {
                const ingestor = await this.moduleRef.resolve(PolkadotBlockIngestor)
                await ingestor.start(config)
                return ingestor
            })()
        )
        this.ingestors.push(...(await Promise.all(newIngestors)))
    }

    public async stop(): Promise<void> {
        const cancellations = this.ingestors.map((ingestor) => ingestor.stop())
        this.ingestors.length = 0
        await Promise.all(cancellations)
    }
}
