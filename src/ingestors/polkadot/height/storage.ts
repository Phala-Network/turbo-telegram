import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { AppConfigService } from '../../../config'
import { BlockHeight, BlockStatus } from './entities'

@Injectable()
export class BlockHeightStorage {
    private readonly nodename: string

    constructor(
        { nodename }: AppConfigService,
        @InjectEntityManager() private readonly entityManager: EntityManager,
        @InjectRepository(BlockHeight) private readonly entities: Repository<BlockHeight>
    ) {
        this.nodename = nodename
    }

    /**
     *
     * @param height current block height to acknowledge
     * @param name chain name (identifier)
     * @returns acknowledge or not (someone else already acknowledged)
     */
    public async acknowledge(height: bigint, name: string): Promise<boolean> {
        return await this.entityManager.transaction(async (tx) => {
            const entities = tx.getRepository(BlockHeight)
            const rows = await entities.count({ where: { name, number: height.toString() } })
            if (rows === 0) {
                await entities.save({
                    name,
                    node: this.nodename,
                    number: height.toString(),
                    status: BlockStatus.Acknowledged,
                })
                return true
            } else {
                return false
            }
        })
    }

    /**
     * get current acknowledged height
     */
    public async get(name: string): Promise<bigint | undefined> {
        const result = (
            await this.entities.find({
                order: { number: 'DESC' },
                take: 1,
                where: { name },
            })
        )[0]?.number
        return result !== undefined ? BigInt(result) : undefined
    }

    public async getProcessed(name: string): Promise<bigint | undefined> {
        const result = (
            await this.entities.find({
                order: { number: 'DESC' },
                take: 1,
                where: { name, status: BlockStatus.Processed },
            })
        )[0]?.number
        return result !== undefined ? BigInt(result) : undefined
    }

    public async markProcessed(height: bigint, name: string): Promise<void> {
        const result = await this.entities.update(
            {
                name,
                node: this.nodename,
                number: height.toString(),
                status: BlockStatus.Acknowledged,
            },
            { status: BlockStatus.Processed }
        )

        if (result.affected !== 1) {
            throw new Error(`Marking not acknowledged block #${height} for chain ${name}`)
        }
    }
}
