import { ObjectType } from '@nestjs/graphql'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export enum BlockStatus {
    Acknowledged = 'acked',
    Processed = 'processed',
}

export interface IBlockHeight {
    number: string
    status: BlockStatus
}

@Entity()
@Index(['name', 'number'], { unique: true })
@ObjectType()
export class BlockHeight implements IBlockHeight {
    @PrimaryGeneratedColumn() public id!: number

    @Column({ nullable: false, type: 'varchar' })
    public name!: string

    @Column({ nullable: false, type: 'varchar' })
    public node!: string

    @Column({ nullable: false, type: 'bigint' })
    public number!: string

    @Column({ enum: BlockStatus, nullable: false, type: 'enum' })
    public status!: BlockStatus
}
