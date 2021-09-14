import { Args, Query, Resolver } from '@nestjs/graphql'
import { WorkerStat } from './entities'
import { BlockWorkerStatStorage } from './storage'

const defaultHourLimit = 7 * 24
const maxHourLimit = 7 * 24

@Resolver(WorkerStat)
export class BlockWorkerStatResolver {
    constructor(private readonly storage: BlockWorkerStatStorage) {}

    @Query(() => [WorkerStat])
    async workerStatsPerHour(
        @Args({ description: 'Public key of worker to be queried', name: 'publicKey' }) publicKey: string,
        @Args({ description: 'Chain name to be queried', name: 'chainName' }) chainName: string,
        @Args({ defaultValue: defaultHourLimit, description: 'Hours of history to be queried', name: 'limit' })
        limit: number
    ): Promise<WorkerStat[]> {
        if (limit < 0 || limit > maxHourLimit) {
            throw new Error('Limit is out of range')
        }
        return await this.storage.findByPublicKeyPerHour(publicKey, chainName, limit)
    }
}
