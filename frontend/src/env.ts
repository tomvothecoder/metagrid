/**
 * This file transforms environment variables into constants for re-usability.
 *
 * Make sure it is consistent with .envs/frontend, .react!
 */

// MetaGrid API
// ------------------------------------------------------------------------------
// https://github.com/aims-group/metagrid/tree/master/backend
export const metagridApiURL = `${
  process.env.REACT_APP_METAGRID_API_URL as string
}`;

// ESGF wget API
// ------------------------------------------------------------------------------
// https://github.com/ESGF/esgf-wget
export const wgetApiURL = process.env.REACT_APP_WGET_API_URL as string;

// ESGF Search API
// ------------------------------------------------------------------------------
// https://esgf.github.io/esg-search/ESGF_Search_RESTful_API.html
export const esgfNodeURL = `${process.env.REACT_APP_ESGF_NODE_URL as string}`;
export const esgfNodeURLNoProtocol = esgfNodeURL.split('//')[1];

// ESGF Node Status API
// ------------------------------------------------------------------------------
// https://github.com/ESGF/esgf-utils/blob/master/node_status/query_prom.py
export const nodeStatusURL = `${
  process.env.REACT_APP_ESGF_NODE_STATUS_URL as string
}`;

// cors-anywhere proxy
// ------------------------------------------------------------------------------
// https://github.com/Rob--W/cors-anywhere
export const proxyURL = `${process.env.REACT_APP_CORS_PROXY_URL as string}`;

// Keycloak
// ------------------------------------------------------------------------------
// https://github.com/keycloak/keycloak
export const keycloakRealm = process.env.REACT_APP_KEYCLOAK_REALM as string;
export const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL as string;
export const keycloakClientId = process.env
  .REACT_APP_KEYCLOAK_CLIENT_ID as string;

// react-hotjar
// ------------------------------------------------------------------------------
// https://github.com/abdalla/react-hotjar
export const hjid = (process.env.REACT_APP_HOTJAR_ID as unknown) as number;
export const hjsv = (process.env.REACT_APP_HOTJAR_SV as unknown) as number;

// react-ga
// ------------------------------------------------------------------------------
// https://github.com/react-ga/react-ga
export const gaTrackingID = process.env
  .REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID as string;
