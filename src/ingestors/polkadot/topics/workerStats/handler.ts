import { Injectable, Logger } from '@nestjs/common'
import { ApiPromise } from '@polkadot/api'
import { encodeAddress } from '@polkadot/keyring'
import { Option, u64 } from '@polkadot/types'
import { AccountId, BalanceOf, BlockNumber } from '@polkadot/types/interfaces'
import { u8aToHex } from '@polkadot/util'
import { Decimal } from 'decimal.js'
import { WorkerStat } from './entities'
import { BlockWorkerStatStorage } from './storage'

const TwoSixtyFour = new Decimal(2).pow(64)

@Injectable()
export class BlockWorkerStatHandler {
    constructor(private readonly storage: BlockWorkerStatStorage) {}

    private readonly logger = new Logger(BlockWorkerStatHandler.name)

    async importAt(height: BlockNumber, api: ApiPromise, chain: string, chainName: string): Promise<number> {
        const hash = await api.rpc.chain.getBlockHash(height)
        const timestamp = await api.query.timestamp.now.at(hash)

        const workers = await api.query.phalaMining.miners.entriesAt(hash)
        const publicKeys = [...workers.map(([publicKey]) => publicKey)]

        const [miners, pids, stakes] = await Promise.all([
            api.query.phalaMining.workerBindings.multi(publicKeys),
            api.query.phalaStakePool.workerAssignments.multi(publicKeys),
            api.query.phalaMining.stakes.multi(publicKeys),
        ])

        const entities = workers.map<WorkerStat>(([publicKey, infoCodec], idx) => {
            const {
                benchmark: { pInstant },
                state,
                stats: { totalReward },
                v,
            } = infoCodec.unwrap()

            const entity = new WorkerStat()
            entity.block = height.toBigInt()
            entity.blockTimestamp = new Date(timestamp.toNumber())
            entity.chain = chain
            entity.chainName = chainName
            entity.miner = encodeAddress((miners[idx] as Option<AccountId>).unwrapOrDefault())
            entity.p = pInstant.toBigInt() ?? 0
            entity.pid = (pids[idx] as Option<u64>).unwrapOrDefault().toBigInt()
            entity.publicKey = u8aToHex(publicKey)
            entity.stake = (stakes[idx] as Option<BalanceOf>).unwrapOrDefault().toBigInt()
            entity.state = state.toString()
            entity.totalReward = totalReward.toString()
            entity.v = new Decimal(v.toString()).div(TwoSixtyFour).toString()
            return entity
        })
        await this.storage.write(entities)

        this.logger.debug(`written ${entities.length} workers for block ${height.toString()}`)

        return entities.length
    }
}
