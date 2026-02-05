import { describe, expect, it, mock } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

const existsSyncMock = mock(() => true);
const readFileSyncMock = mock(() => '{"apiKey":"k","claimCode":"c"}');
mock.module('fs', () => ({
  ...fs,
  existsSync: existsSyncMock,
  readFileSync: readFileSyncMock,
}));
mock.module('path', () => ({
  ...path,
  join: mock((...args: string[]) => args.join('/')),
}));

const { readHackathonSecrets } = await import('../secrets');

describe('readHackathonSecrets', () => {
  it('returns null when file does not exist', () => {
    existsSyncMock.mockReturnValue(false);
    const result = readHackathonSecrets();
    expect(result).toBeNull();
  });

  it('returns parsed secrets when file exists and is valid JSON', () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(
      '{"apiKey":"key123","claimCode":"code456","agentId":1}'
    );
    const result = readHackathonSecrets();
    expect(result).toEqual({
      apiKey: 'key123',
      claimCode: 'code456',
      agentId: 1,
    });
  });

  it('returns null when readFileSync throws', () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const result = readHackathonSecrets();
    expect(result).toBeNull();
  });

  it('returns null when JSON is invalid', () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue('not json');
    const result = readHackathonSecrets();
    expect(result).toBeNull();
  });
});
