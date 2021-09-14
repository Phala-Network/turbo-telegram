import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkerStat } from './entities'

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

    public async write(entities: WorkerStat[]): Promise<void> {
        // TODO: validate incoming entities
        await this.repository.save(entities)
    }
}
