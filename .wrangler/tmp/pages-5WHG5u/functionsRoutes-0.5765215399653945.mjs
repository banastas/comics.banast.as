import { onRequestGet as __api_comics_stats_ts_onRequestGet } from "/Users/banastas/GitHub/comics.banast.as/functions/api/comics/stats.ts"
import { onRequestOptions as __api_comics_stats_ts_onRequestOptions } from "/Users/banastas/GitHub/comics.banast.as/functions/api/comics/stats.ts"
import { onRequestGet as __api_comics_ts_onRequestGet } from "/Users/banastas/GitHub/comics.banast.as/functions/api/comics.ts"
import { onRequestOptions as __api_comics_ts_onRequestOptions } from "/Users/banastas/GitHub/comics.banast.as/functions/api/comics.ts"

export const routes = [
    {
      routePath: "/api/comics/stats",
      mountPath: "/api/comics",
      method: "GET",
      middlewares: [],
      modules: [__api_comics_stats_ts_onRequestGet],
    },
  {
      routePath: "/api/comics/stats",
      mountPath: "/api/comics",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_comics_stats_ts_onRequestOptions],
    },
  {
      routePath: "/api/comics",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_comics_ts_onRequestGet],
    },
  {
      routePath: "/api/comics",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_comics_ts_onRequestOptions],
    },
  ]