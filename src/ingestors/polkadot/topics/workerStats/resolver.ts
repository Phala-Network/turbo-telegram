import { Args, Query, Resolver } from '@nestjs/graphql'
import { WorkerStat } from './entities'
import { BlockWorkerStatStorage } from './storage'

@Resolver(WorkerStat)
export class BlockWorkerStatResolver {
    constructor(private readonly storage: BlockWorkerStatStorage) {}

    @Query(() => [WorkerStat])
    async workerStatsPerHour(@Args('publicKey') publicKey: string): Promise<WorkerStat[]> {
        return await this.storage.findByPublicKeyPerHour(publicKey)
    }
}
