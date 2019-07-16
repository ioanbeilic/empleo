import axios, { AxiosError } from 'axios';
import qs from 'querystring';

export const getCandidateToken = login(getKeycloakCandidateCredentials);

export const getAdminToken = login(getKeycloakAdminCredentials);

export const getEntityAdminToken = login(getKeycloakEntityAdminCredentials);

function isAxiosError(error: any): error is AxiosError {
  return error && error.isAxiosError;
}

function login(credentials: () => Credentials) {
  return () => {
    const { username, password } = credentials();
    const issuer = getEnv('KEYCLOAK_ISSUER');

    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    const payload = qs.stringify({
      username,
      password,
      client_id: 'Empleo',
      grant_type: 'password'
    });

    return axios
      .post(`${issuer}/protocol/openid-connect/token`, payload, { headers })
      .then(({ data }) => data.access_token as string)
      .catch(err => {
        if (isAxiosError(err)) {
          throw Object.assign(new Error('could not get the token'), {
            response: err.response,
            data: err.response && err.response.data
          });
        }

        throw new Error(`could not get the token: ${err.message}`);
      });
  };
}

function getKeycloakAdminCredentials(): Credentials {
  const username = getEnv('KEYCLOAK_ADMIN_USER');
  const password = getEnv('KEYCLOAK_ADMIN_PASS');

  return { username, password };
}

function getKeycloakCandidateCredentials(): Credentials {
  const username = getEnv('KEYCLOAK_CANDIDATE_USER');
  const password = getEnv('KEYCLOAK_CANDIDATE_PASS');

  return { username, password };
}

function getKeycloakEntityAdminCredentials(): Credentials {
  const username = getEnv('KEYCLOAK_ENTITY_ADMIN_USER');
  const password = getEnv('KEYCLOAK_ENTITY_ADMIN_PASS');

  return { username, password };
}

function getEnv(variable: keyof typeof process.env): string {
  if (process.env[variable]) {
    return process.env[variable]!;
  }

  throw new Error(`The environment variable ${variable} must be set in order to launch integration test`);
}

export interface Credentials {
  username: string;
  password: string;
}
