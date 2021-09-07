import { InfluxDB } from '@influxdata/influxdb-client'
import { Injectable, Logger } from '@nestjs/common'
import { StorageConfig } from './config'

@Injectable()
export class InfluxDBClientProvider {
    public readonly client: InfluxDB

    private readonly logger = new Logger(InfluxDBClientProvider.name)

    constructor({ influxdb: { nodename, token, url } }: StorageConfig) {
        this.client = new InfluxDB({
            token,
            url,
            writeOptions: {
                defaultTags: {
                    node: nodename,
                },
                flushInterval: 10 * 1000, // TODO: configurable flush interval
                writeFailed: (error, lines) => {
                    this.logger.error(`failed to flush ${lines.length} lines:`, error)
                },
                writeSuccess: (lines) => {
                    this.logger.debug(`flushed ${lines.length} lines`)
                },
            },
        })
    }
}
