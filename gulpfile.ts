import { typesChain } from '@phala/typedefs'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { config as configureDotEnv } from 'dotenv'
import execa from 'execa'
import { mkdir, writeFile } from 'fs/promises'
import { series } from 'gulp'
import { resolve } from 'path'

configureDotEnv()

const DEFAULT_NETWORK_ENDPOINT = 'wss://khala-api.phala.network/ws'
const endpoint = process.env['NETWORK_ENDPOINT'] ?? DEFAULT_NETWORK_ENDPOINT

export const typegenFromDefinitions = async (): Promise<void> => {
    const provider = new WsProvider(endpoint)
    const api = await ApiPromise.create({ provider, typesChain })
    const chain = (await api.rpc.system.chain()).toString()
    await provider.disconnect()

    console.info(`Generating type definition, chain=${chain}, reflect_endpoint=${endpoint}`)

    const definitions = `
        import { typesChain } from '@phala/typedefs'
        export default {
            types: typesChain['${chain}']
        }
    `

    const interfacesPath = resolve(__dirname, 'src', 'ingestors', 'polkadot', 'interfaces', 'phala')
    await mkdir(interfacesPath, { recursive: true })
    await writeFile(resolve(interfacesPath, 'definitions.ts'), definitions)

    await execa(
        'ts-node',
        [
            '--skip-project',
            'node_modules/@polkadot/typegen/scripts/polkadot-types-from-defs.cjs',
            '--package',
            '.',
            '--input',
            './src/ingestors/polkadot/interfaces',
        ],
        {
            stdio: 'inherit',
        }
    )
}

export const typegenFromMetadata = async (): Promise<void> => {
    console.info('Generating from metadata using endpoint:', endpoint)

    await execa(
        'ts-node',
        [
            '--skip-project',
            'node_modules/@polkadot/typegen/scripts/polkadot-types-from-chain.cjs',
            '--package',
            '.',
            '--output',
            './src/ingestors/polkadot/interfaces',
            '--endpoint',
            endpoint,
        ],
        {
            stdio: 'inherit',
        }
    )
}

export const typegen = series(typegenFromDefinitions, typegenFromMetadata)

export const configure = series(typegen)

export const typescript = async (): Promise<void> => {
    await execa('npx', ['tsc', '--build'])
}
