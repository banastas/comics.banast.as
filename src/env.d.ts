interface ImportMetaEnv {
  /** "cloudflare" serves resized covers through /cdn-cgi/image (see utils/covers.ts). */
  readonly PUBLIC_COVER_RESIZE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
