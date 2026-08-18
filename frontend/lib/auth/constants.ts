export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 48 * 60 * 60;

const production = process.env.NODE_ENV === "production";

// __Host- cookies are accepted only over HTTPS and cannot set a Domain attribute.
export const ACCESS_COOKIE_NAME = production
  ? "__Host-grazing_access"
  : "grazing_access";

export const REFRESH_COOKIE_NAME = production
  ? "__Host-grazing_refresh"
  : "grazing_refresh";
