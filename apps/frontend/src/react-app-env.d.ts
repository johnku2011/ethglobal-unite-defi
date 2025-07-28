/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_ONEINCH_API_KEY: string
    readonly REACT_APP_WORMHOLE_API_KEY: string
    readonly REACT_APP_INFURA_PROJECT_ID: string
    readonly REACT_APP_WALLETCONNECT_PROJECT_ID: string
    readonly REACT_APP_ENVIRONMENT: 'development' | 'staging' | 'production'
  }
}

interface Window {
  ethereum?: any
} 