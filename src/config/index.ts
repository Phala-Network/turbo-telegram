import { Injectable, Module } from '@nestjs/common'
import { IIngestorConfiguration as IIngestorConfig } from '../ingestors/config'
import { load } from './loaders'

export interface IAppConfig {
    readonly ingestors: IIngestorConfig
}

@Injectable()
export class AppConfigService implements IAppConfig {
    public readonly ingestors: IIngestorConfig

    constructor() {
        const { ingestors } = load()
        this.ingestors = ingestors
    }
}

@Module({
    exports: [AppConfigService],
    providers: [AppConfigService],
})
export class AppConfigModule {}
