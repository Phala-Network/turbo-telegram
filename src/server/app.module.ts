import { Module } from '@nestjs/common'
import { AppConfigModule } from '../config'
import { IngestorModule } from '../ingestors/config'
import { PolkadotIngestorModule } from '../ingestors/polkadot'
import { StorageModule } from '../storage'

@Module({
    imports: [AppConfigModule, IngestorModule, PolkadotIngestorModule, StorageModule],
    providers: [],
})
export class AppModule {}
