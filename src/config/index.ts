import { Injectable, Module } from '@nestjs/common'
import { IIngestorConfiguration as IIngestorConfig } from '../ingestors/config'
import { IInfluxDBConfig } from '../storage/config'
import { load } from './loaders'

export interface IAppConfig {
    readonly influxdb: IInfluxDBConfig
    readonly ingestors: IIngestorConfig
}

@Injectable()
export class AppConfigService implements IAppConfig {
    public readonly influxdb: IInfluxDBConfig
    public readonly ingestors: IIngestorConfig

    constructor() {
        const { influxdb, ingestors } = load()
        this.influxdb = influxdb
        this.ingestors = ingestors
    }
}

@Module({
    exports: [AppConfigService],
    providers: [AppConfigService],
})
export class AppConfigModule {}
