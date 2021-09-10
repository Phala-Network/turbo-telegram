import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppConfigModule } from '../config'
import { WorkerStat } from '../ingestors/polkadot/topics/workerStats/entities'
import { StorageConfig } from './config'

export const entities = [WorkerStat]

@Module({
    imports: [AppConfigModule, TypeOrmModule.forFeature(entities)],
    providers: [StorageConfig],
})
export class StorageModule {}
