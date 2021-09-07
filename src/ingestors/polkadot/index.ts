import { Injectable, Module, OnApplicationBootstrap } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AppConfigModule, AppConfigService } from '../../config'
import { StorageModule } from '../../storage'
import { PolkadotIngestor } from './ingestor'

export interface IPolkadotIngestorDataSource {
    endpoint: string
    name: string
}

export interface IPolkadotIngestorConfiguration {
    dataSources: IPolkadotIngestorDataSource[]
}

@Injectable()
export class PolkadotIngestorRoot {
    private readonly ingestors: PolkadotIngestor[] = []

    constructor(private readonly config: AppConfigService, private readonly moduleRef: ModuleRef) {}

    public async start() {
        this.ingestors.push(
            ...(await Promise.all(
                this.config.ingestors.polkadot.dataSources.map(
                    (config) =>
                        new Promise<PolkadotIngestor>(async () => {
                            const ingestor = await this.moduleRef.resolve(PolkadotIngestor)
                            await ingestor.start(config)

                            return ingestor
                        })
                )
            ))
        )
    }

    public async stop() {
        while (true) {
            const ingestor = this.ingestors.pop()
            ingestor?.stop()

            if (ingestor === undefined) {
                break
            }
        }
    }
}

@Module({
    imports: [AppConfigModule, StorageModule],
    providers: [PolkadotIngestor, PolkadotIngestorRoot],
})
export class PolkadotIngestorModule implements OnApplicationBootstrap {
    constructor(private readonly moduleRef: ModuleRef) {}

    async onApplicationBootstrap() {
        const root = this.moduleRef.get(PolkadotIngestorRoot)
        await root.start()
    }
}
