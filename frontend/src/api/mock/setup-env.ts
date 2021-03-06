/**
 * This file imports the mock-service-worker server to all tests before initialization.
 * Import this in setupTests.ts.
 */

import { rest, server } from './server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { server, rest };
