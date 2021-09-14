import { readFileSync } from 'fs'
import { merge } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { IAppConfig } from '.'

export function load(): IAppConfig {
    const defaultConfig: IAppConfig = {
        ingestors: {
            polkadot: {
                dataSources: [],
            },
        },
        nodename: uuidv4(),
    }

    try {
        const customConfig = JSON.parse(readFileSync('config.json').toString()) as unknown
        return merge(defaultConfig, customConfig)
    } catch (error) {
        console.error('WARNING: cannot load config.json,', error)
        return defaultConfig
    }
}
