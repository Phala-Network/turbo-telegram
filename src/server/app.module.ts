import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppConfigModule } from '../config'
import { IngestorModule } from '../ingestors/config'
import { PolkadotIngestorModule } from '../ingestors/polkadot'
import { WorkerStat } from '../ingestors/polkadot/topics/workerStats/entities'
import { StorageModule } from '../storage'

@Module({
    imports: [
        AppConfigModule,
        GraphQLModule.forRoot({ autoSchemaFile: true, playground: true }),
        IngestorModule,
        PolkadotIngestorModule,
        StorageModule,
        TypeOrmModule.forRoot({ ...require('../../ormconfig.json'), entities: [WorkerStat] }),
    ],
})
export class AppModule {}
