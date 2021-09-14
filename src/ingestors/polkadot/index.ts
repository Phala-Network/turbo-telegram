import { Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppConfigModule, AppConfigService } from '../../config'
import { PolkadotBlockIngestor, PolkadotBlockIngestorRoot } from './blockHandlers'
import { BlockHeight } from './height/entities'
import { BlockHeightStorage } from './height/storage'
import { WorkerStat } from './topics/workerStats/entities'
import { BlockWorkerStatHandler } from './topics/workerStats/handler'
import { BlockWorkerStatResolver } from './topics/workerStats/resolver'
import { BlockWorkerStatStorage } from './topics/workerStats/storage'

export interface IPolkadotIngestorDataSource {
    endpoint: string
    name: string
    startHeight: number
}

export interface IPolkadotIngestorConfiguration {
    dataSources: IPolkadotIngestorDataSource[]
}

@Module({
    imports: [AppConfigModule, TypeOrmModule.forFeature([BlockHeight, WorkerStat])],
    providers: [
        BlockHeightStorage,
        BlockWorkerStatHandler,
        BlockWorkerStatResolver,
        BlockWorkerStatStorage,
        PolkadotBlockIngestor,
        PolkadotBlockIngestorRoot,
    ],
})
export class PolkadotIngestorModule implements OnApplicationBootstrap, OnApplicationShutdown {
    private blockIngestorRoot?: PolkadotBlockIngestorRoot

    constructor(private readonly config: AppConfigService, private readonly moduleRef: ModuleRef) {}

    async onApplicationBootstrap(): Promise<void> {
        this.blockIngestorRoot = this.moduleRef.get(PolkadotBlockIngestorRoot)
        await this.blockIngestorRoot.start(this.config.ingestors.polkadot.dataSources)
    }

    async onApplicationShutdown(): Promise<void> {
        await this.blockIngestorRoot?.stop()
    }
}
