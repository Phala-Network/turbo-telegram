import { Injectable, Module } from '@nestjs/common'
import { AppConfigModule, AppConfigService } from '../../config'
import { IPolkadotIngestorConfiguration } from '../polkadot'

export interface IIngestorConfiguration {
    polkadot: IPolkadotIngestorConfiguration
}

@Injectable()
export class IngestorConfigProvider implements IIngestorConfiguration {
    public readonly polkadot: IPolkadotIngestorConfiguration

    constructor(parent: AppConfigService) {
        const { polkadot } = parent.ingestors
        this.polkadot = polkadot
    }
}

@Module({
    exports: [IngestorConfigProvider],
    imports: [AppConfigModule],
    providers: [IngestorConfigProvider],
})
export class IngestorModule {}
