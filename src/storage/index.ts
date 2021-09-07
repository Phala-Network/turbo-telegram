import { Module } from '@nestjs/common'
import { AppConfigModule } from '../config'
import { BlockHeightStorage } from './blockHeight'
import { StorageConfig } from './config'
import { InfluxDBClientProvider } from './influxdb'

@Module({
    exports: [BlockHeightStorage],
    imports: [AppConfigModule],
    providers: [BlockHeightStorage, StorageConfig, InfluxDBClientProvider],
})
export class StorageModule {}
