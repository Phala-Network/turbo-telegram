import { Injectable, Logger, Scope } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { typesChain } from '@phala/typedefs'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { IPolkadotIngestorDataSource } from '.'
import { BlockHeightStorage } from './height/storage'
import { BlockWorkerStatHandler } from './topics/workerStats/handler'

const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m))

@Injectable({ scope: Scope.TRANSIENT })
export class PolkadotBlockIngestor {
    private readonly logger = new Logger(PolkadotBlockIngestor.name)

    private stopped = false

    constructor(private readonly height: BlockHeightStorage, private readonly moduleRef: ModuleRef) {}

    public async run({ endpoint, name, startHeight }: IPolkadotIngestorDataSource): Promise<void> {
        const api = await ApiPromise.create({ provider: new WsProvider(endpoint), typesChain })
        await cryptoWaitReady()
        const chain = (await api.rpc.system.chain()).toString()

        this.logger.debug(`connected to chainName=${name}, chain=${chain}`)

        const workerStatHandler = await this.moduleRef.resolve(BlockWorkerStatHandler)

        while (!this.stopped) {
            const [chainHeight, lastHeight] = await Promise.all([
                api.query.system.number().then((number) => number.toBigInt()),
                this.height.get(name).then((number) => number ?? BigInt(0)),
            ])
            this.logger.debug(`chain=${name}, last-acknowledged=${lastHeight}, target=${chainHeight}`)

            for (
                let i = bigIntMax(BigInt(startHeight), lastHeight + BigInt(1));
                i <= chainHeight && !this.stopped;
                i++
            ) {
                const ack = await this.height.acknowledge(i, name)
                if (!ack) {
                    continue
                }
                this.logger.debug(`chain=${name}, acknowledged=${i}, target=${chainHeight}`)

                const blockNumber = api.createType('BlockNumber', i.toString())

                await workerStatHandler.importAt(blockNumber, api, chain, name)

                await this.height.markProcessed(i, name)
            }
        }
    }

    public stop(): void {
        this.stopped = true
    }
}

@Injectable()
export class PolkadotBlockIngestorRoot {
    private readonly logger = new Logger(PolkadotBlockIngestorRoot.name)

    private readonly ingestors: PolkadotBlockIngestor[] = []

    constructor(private readonly moduleRef: ModuleRef) {}

    public async start(configs: IPolkadotIngestorDataSource[]): Promise<void> {
        const newIngestors = configs.map((config) =>
            (async () => {
                const ingestor = await this.moduleRef.resolve(PolkadotBlockIngestor)
                ingestor.run(config).catch((error) => {
                    this.logger.error(`ingestor for chain ${config.name} failed:`, error)
                    process.kill(process.pid, 'SIGTERM')
                })
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
