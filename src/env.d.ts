interface ImportMetaEnv {
  /** "off" serves original cover files instead of resized ones (see utils/covers.ts). */
  readonly PUBLIC_COVER_RESIZE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
