import { readFileSync } from 'fs'
import { merge } from 'lodash'
import { IAppConfig } from '.'

export function load(): IAppConfig {
    const defaultConfig: IAppConfig = {
        influxdb: {
            bucket: 'data-server',
            nodename: 'unnamed',
            org: 'data-server',
            token: 'let-me-in',
            url: 'http://localhost:8086',
        },
        ingestors: {
            polkadot: {
                dataSources: [],
            },
        },
    }

    try {
        const customConfig = JSON.parse(readFileSync('config.json').toString()) as unknown
        return merge(defaultConfig, customConfig)
    } catch (error) {
        console.error('WARNING: cannot load config.json,', error)
        return defaultConfig
    }
}
