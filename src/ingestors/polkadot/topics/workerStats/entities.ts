import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export interface IWorkerStat {
    publicKey: string

    chain: string
    chainName: string

    block: bigint | number
    blockTimestamp: Date

    miner: string
    p: bigint | number
    pid: bigint | number
    stake: bigint | number
    state: string
    totalReward: string
    v: string
}

@Entity()
@ObjectType()
export class WorkerStat implements IWorkerStat {
    @PrimaryGeneratedColumn() public id!: number

    @Column({ nullable: false, type: 'varchar' })
    @Field()
    @Index()
    public publicKey!: string

    @Column({ nullable: false, type: 'varchar' })
    @Field()
    @Index()
    public chain!: string

    @Column({ nullable: false, type: 'varchar' })
    @Field()
    @Index()
    public chainName!: string

    @Column({ nullable: false, type: 'bigint' })
    @Field(() => Int)
    @Index()
    public block!: bigint | number

    @Column({ nullable: false, type: 'timestamp' })
    @Field()
    public blockTimestamp!: Date

    @Column({ nullable: false, type: 'bigint' })
    @Field(() => Int)
    public pid!: bigint | number

    @Column({ nullable: false, type: 'varchar' })
    @Field()
    public miner!: string

    @Column({ nullable: false, type: 'bigint' })
    @Field(() => Int)
    public p!: number | bigint

    @Column({ nullable: false, type: 'bigint' })
    @Field(() => Int)
    public stake!: number | bigint

    @Column({ nullable: false, type: 'varchar' })
    @Field()
    public state!: string

    @Column({ nullable: false, type: 'bigint' })
    @Field()
    public totalReward!: string

    @Column({ nullable: false, type: 'double precision' })
    @Field()
    public v!: string
}
