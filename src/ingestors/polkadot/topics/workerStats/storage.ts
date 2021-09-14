import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkerStat } from './entities'

export interface IOverallStat {
    block: number
    count: number
    state: string

    pSum: string
    stakeSum: string
    totalRewardSum: string
    vSum: string
}

@Injectable()
export class BlockWorkerStatStorage {
    constructor(@InjectRepository(WorkerStat) private readonly repository: Repository<WorkerStat>) {}

    public async findByPublicKeyPerHour(publicKey: string, name: string, limit?: number): Promise<WorkerStat[]> {
        const query = this.repository
            .createQueryBuilder('record')
            .distinctOn([`date_trunc('hour', "blockTimestamp")`])
            .orderBy(`date_trunc('hour', "blockTimestamp")`, 'DESC')
            .limit(limit)
            .where('record.chainName = :chainName', { chainName: name })
            .where('record.publicKey = :publicKey', { publicKey })
        return await query.getMany()
    }

    public async findOverallStats(name: string, limit: number, last?: Date): Promise<IOverallStat[]> {
        let query = this.repository
            .createQueryBuilder('record')

            .select('count(record.publicKey)', 'count')
            .addSelect('record.block', 'block')
            .addSelect('record.blockTimestamp', 'blockTimestamp')
            .addSelect('record.state', 'state')

            .addSelect('sum(record.p)', 'pSum')
            .addSelect('sum(record.stake)', 'stakeSum')
            .addSelect('sum(record.totalReward)', 'totalRewardSum')
            .addSelect('sum(record.v)', 'vSum')

            .addGroupBy('record.block')
            .addGroupBy('record.blockTimestamp')
            .addGroupBy('record.state')
            .addGroupBy(`date_trunc('hour', "record"."blockTimestamp")`)

            .where('record.chainName = :name', { name })

            .orderBy('record.blockTimestamp', 'DESC')

            .limit(limit)

        if (last !== undefined) {
            query = query.andWhere('record.blockTimestamp < :last', { last: last.toISOString() })
        }

        return (await query.getRawMany()) as unknown as IOverallStat[]
    }

    public async write(entities: WorkerStat[]): Promise<void> {
        // TODO: validate incoming entities
        await this.repository.save(entities)
    }
}
