// @vitest-environment node
import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dexie from 'dexie';
import IndexedDBConnector from './IndexedDBConnector.js';

/**
 * Tests for IndexedDBEngine.addSchema serialization.
 *
 * `fake-indexeddb/auto` installs an in-memory IndexedDB on globalThis, so real
 * Dexie runs end-to-end with no mocking. For tests that need to inject failures
 * or observe open() concurrency, we wrap Dexie.prototype.open with vi.spyOn.
 */

function makeSchema(name, primaryKey = 'id') {
  return {
    name,
    _schema: {
      primaryKey,
      properties: {
        [primaryKey]: { type: 'number', autoIncrement: true },
        value: { type: 'string', indexed: true },
      },
      required: [primaryKey],
    },
  };
}

// Each test gets a unique db so fake-indexeddb state can't leak across tests.
let dbCounter = 0;
const uniqueDbName = (label) => `${label}-${Date.now()}-${++dbCounter}`;

describe('IndexedDBEngine.addSchema serialization', () => {
  let engine;

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    engine = new IndexedDBConnector(uniqueDbName('race'), 1).engine;
    await engine.initialize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine?.db) engine.db.close();
  });

  describe('pre-initialization guard', () => {
    it('rejects if addSchema is called before initialize() resolves', async () => {
      const fresh = new IndexedDBConnector(uniqueDbName('pre-init'), 1).engine;
      await expect(fresh.addSchema('users', makeSchema('users'))).rejects.toThrow(
        /Database not initialized/,
      );
    });
  });

  describe('serialization under concurrent adds (race-condition repro)', () => {
    it('never has more than one open() in-flight across concurrent addSchema calls', async () => {
      let inFlight = 0;
      let maxConcurrent = 0;
      const realOpen = Dexie.prototype.open;
      vi.spyOn(Dexie.prototype, 'open').mockImplementation(async function () {
        inFlight++;
        maxConcurrent = Math.max(maxConcurrent, inFlight);
        try {
          return await realOpen.call(this);
        } finally {
          inFlight--;
        }
      });

      await Promise.all([
        engine.addSchema('alpha', makeSchema('alpha')),
        engine.addSchema('beta', makeSchema('beta')),
        engine.addSchema('gamma', makeSchema('gamma')),
      ]);

      expect(maxConcurrent).toBe(1);
    });

    it('preserves enqueue order — the final db contains schemas in call order', async () => {
      await Promise.all([
        engine.addSchema('alpha', makeSchema('alpha')),
        engine.addSchema('beta', makeSchema('beta')),
        engine.addSchema('gamma', makeSchema('gamma')),
      ]);

      // Dexie exposes tables in declaration order; the engine declares them
      // by re-collecting `this.schemas` (insertion order) on every reopen.
      expect(engine.db.tables.map((t) => t.name)).toEqual(['alpha', 'beta', 'gamma']);
    });
  });

  describe('success assertions after concurrent adds', () => {
    it('records every schema and increments version once per addSchema', async () => {
      const initialVersion = engine.version;

      await Promise.all([
        engine.addSchema('a', makeSchema('a')),
        engine.addSchema('b', makeSchema('b')),
        engine.addSchema('c', makeSchema('c')),
      ]);

      expect(Object.keys(engine.schemas).sort()).toEqual(['a', 'b', 'c']);
      expect(engine.version).toBe(initialVersion + 3);
    });

    it('engine.db is the latest open instance and is queryable for every table', async () => {
      await Promise.all([
        engine.addSchema('a', makeSchema('a')),
        engine.addSchema('b', makeSchema('b')),
      ]);

      expect(engine.db.isOpen()).toBe(true);
      expect(engine.db.tables.map((t) => t.name).sort()).toEqual(['a', 'b']);

      await engine.db.table('a').add({ value: 'in-a' });
      await engine.db.table('b').add({ value: 'in-b' });
      expect(await engine.db.table('a').toArray()).toHaveLength(1);
      expect(await engine.db.table('b').toArray()).toHaveLength(1);
    });
  });

  describe('error assertions', () => {
    it('rejects the failing addSchema call with the underlying error', async () => {
      const realOpen = Dexie.prototype.open;
      let calls = 0;
      vi.spyOn(Dexie.prototype, 'open').mockImplementation(async function () {
        calls++;
        if (calls === 1) throw new Error('forced open failure');
        return realOpen.call(this);
      });

      await expect(engine.addSchema('failing', makeSchema('failing'))).rejects.toThrow(
        /forced open failure/,
      );
    });

    it('does not poison the queue: subsequent addSchema calls still execute after a failure', async () => {
      const realOpen = Dexie.prototype.open;
      let calls = 0;
      vi.spyOn(Dexie.prototype, 'open').mockImplementation(async function () {
        calls++;
        if (calls === 1) throw new Error('forced open failure');
        return realOpen.call(this);
      });

      const failed = engine.addSchema('first', makeSchema('first'));
      const followup = engine.addSchema('second', makeSchema('second'));

      await expect(failed).rejects.toThrow(/forced open failure/);
      await expect(followup).resolves.toBeUndefined();
      expect(engine.schemas).toHaveProperty('second');
      expect(engine.db.tables.map((t) => t.name)).toContain('second');
    });

    it('lets a consumer use Promise.allSettled to react per-schema across concurrent adds', async () => {
      // Realistic Application._initialize() shape: several addSchema calls fire
      // concurrently and the caller wants to handle failures individually rather
      // than have one bad schema abort the whole init.
      // Spy is installed *after* initialize(), so openCalls counts only
      // post-init opens — one per addSchema call.
      const realOpen = Dexie.prototype.open;
      let openCalls = 0;
      vi.spyOn(Dexie.prototype, 'open').mockImplementation(async function () {
        openCalls++;
        if (openCalls === 2) throw new Error('forced open failure');
        return realOpen.call(this);
      });

      const results = await Promise.allSettled([
        engine.addSchema('first', makeSchema('first')),
        engine.addSchema('middle', makeSchema('middle')),
        engine.addSchema('last', makeSchema('last')),
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason.message).toMatch(/forced open failure/);
      expect(results[2].status).toBe('fulfilled');

      const tableNames = engine.db.tables.map((t) => t.name);
      expect(tableNames).toContain('first');
      expect(tableNames).toContain('last');
    });

  });
});
