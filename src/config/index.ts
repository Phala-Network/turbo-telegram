import { Injectable, Module } from '@nestjs/common'
import { IIngestorConfiguration as IIngestorConfig } from '../ingestors/config'
import { load } from './loaders'

export interface IAppConfig {
    readonly ingestors: IIngestorConfig
    readonly nodename: string
}

@Injectable()
export class AppConfigService implements IAppConfig {
    public readonly ingestors: IIngestorConfig
    public readonly nodename: string

    constructor() {
        const { ingestors, nodename } = load()
        this.ingestors = ingestors
        this.nodename = nodename
    }
}

@Module({
    exports: [AppConfigService],
    providers: [AppConfigService],
})
export class AppConfigModule {}
