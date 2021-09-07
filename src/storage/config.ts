import { Injectable } from '@nestjs/common'
import { AppConfigService } from '../config'

export interface IInfluxDBConfig {
    readonly bucket: string
    readonly nodename: string
    readonly org: string
    readonly token: string
    readonly url: string
}

@Injectable()
export class StorageConfig {
    public readonly influxdb: IInfluxDBConfig

    constructor(config: AppConfigService) {
        const { influxdb } = config
        this.influxdb = influxdb
    }
}
