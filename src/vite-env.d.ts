// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_BROKER: string
    readonly VITE_TOPIC: string
    readonly VITE_USER: string
    readonly VITE_PASSWORD: string
    readonly VITE_PORT: string
    readonly VITE_GIT_VERSION: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
