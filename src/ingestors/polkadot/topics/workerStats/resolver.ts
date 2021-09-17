import { Args, Field, ObjectType, Query, Resolver } from '@nestjs/graphql'
import { WorkerStat } from './entities'
import { BlockWorkerStatStorage, IOverallStat } from './storage'

const defaultHourLimit = 24
const maxHourLimit = 7 * 24

@ObjectType()
export class OverallStat implements IOverallStat {
    @Field() public block!: number
    @Field() public blockTimestamp!: Date
    @Field() public count!: number
    @Field() public pSum!: string
    @Field() public stakeSum!: string
    @Field() public state!: string
    @Field() public totalRewardSum!: string
    @Field() public vSum!: string
}

@Resolver(WorkerStat)
export class BlockWorkerStatResolver {
    constructor(private readonly storage: BlockWorkerStatStorage) {}

    @Query(() => [WorkerStat])
    async workerStatsPerHour(
        @Args({
            description: 'Chain name to be queried',
            name: 'chainName',
        })
        chainName: string,
        @Args({
            description: 'Public key of worker to be queried',
            name: 'publicKey',
        })
        publicKey: string,
        @Args({
            defaultValue: defaultHourLimit,
            description: 'Hours of history to be queried',
            name: 'limit',
        })
        limit: number,
        @Args({
            description: 'End date of the range of block timestamp',
            name: 'endDate',
            nullable: true,
        })
        endDate?: string
    ): Promise<WorkerStat[]> {
        return await this.storage.findByPublicKeyPerHour(
            publicKey,
            chainName,
            limit > 0 && limit < maxHourLimit ? limit : defaultHourLimit,
            endDate !== undefined ? new Date(endDate) : undefined
        )
    }

    @Query(() => [OverallStat])
    async workerOverallStats(
        @Args({
            description: 'Chain name to be queried',
            name: 'chainName',
        })
        chainName: string,
        @Args({
            defaultValue: defaultHourLimit,
            description: 'Count of hours to be retrieved backwards',
            name: 'limit',
        })
        limit: number,
        @Args({
            description: 'End date of the range of block timestamp',
            name: 'endDate',
            nullable: true,
        })
        endDate?: string
    ): Promise<OverallStat[]> {
        return (await this.storage.findOverallStats(
            chainName,
            limit > 0 && limit < maxHourLimit ? limit : defaultHourLimit,
            endDate !== undefined ? new Date(endDate) : undefined
        )) as OverallStat[]
    }
}
