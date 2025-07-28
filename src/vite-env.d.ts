/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONEINCH_API_KEY: string
  readonly VITE_WORMHOLE_API_KEY: string
  readonly VITE_INFURA_PROJECT_ID: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 