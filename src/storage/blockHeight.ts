import { Point, WriteApi } from '@influxdata/influxdb-client'
import { Injectable } from '@nestjs/common'
import { StorageConfig } from './config'
import { InfluxDBClientProvider } from './influxdb'

const MEASUREMENT_NAME = 'block_height'

@Injectable()
export class BlockHeightStorage {
    private readonly writer: WriteApi

    constructor({ client }: InfluxDBClientProvider, { influxdb: { bucket, org } }: StorageConfig) {
        this.writer = client.getWriteApi(org, bucket)
    }

    public read() {
        throw new Error('method not implemented')
    }

    /**
     * @param name chain name defined by user
     * @param chain chain name retrieved from the chain
     */
    public write({ chain, height, name }: { chain: string; height: any; name: string }) {
        this.writer.writePoint(
            new Point(MEASUREMENT_NAME).tag('chain', chain).tag('chain_name', name).uintField('height', height)
        )
    }
}
