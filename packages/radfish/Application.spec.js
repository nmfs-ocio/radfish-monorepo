import { vi } from 'vitest';
import { Application, IndexedDBMethod, LocalStorageMethod } from './index';

describe('Application',  () => {
  describe('storage',  () => {
    it('should return the storage method',  () => {
      // IndexedDB Storage application
      const indexedDBMethod = new IndexedDBMethod(
        "test",
        1,
        {
          formData: "uuid, fullName, email, phoneNumber, numberOfFish, species, computedPrice, isDraft",
          species: "name, price",
          homebaseData: "KEY, REPORT_TYPE, SORT_KEY, TRIP_TYPE, VALUE",
        },
      );
      const indexedDBApplication = new Application({
        storage: indexedDBMethod,
      });
      expect (indexedDBApplication.storage).toEqual(indexedDBMethod);

      // Local Storage application
      const localStorageMethod = new LocalStorageMethod(
        "test",
        {
          formData: "uuid, fullName, email, phoneNumber, numberOfFish, species, computedPrice, isDraft",
          species: "name, price",
          homebaseData: "KEY, REPORT_TYPE, SORT_KEY, TRIP_TYPE, VALUE",
        },
      );
      const localStorageApplication = new Application({
        storage: localStorageMethod,
      });
      expect(localStorageApplication.storage).toEqual(localStorageMethod);
    });

    it('should return the storage method using a configuration object', function () {
      const indexedDBApplication = new Application(
        {
          storage: {
            type: "indexedDB",
            name: "test",
            version: 1,
            stores: {
              formData: "uuid, fullName, email, phoneNumber, numberOfFish, species, computedPrice, isDraft",
              species: "name, price",
              homebaseData: "KEY, REPORT_TYPE, SORT_KEY, TRIP_TYPE, VALUE",
            }
          }
        }
      )
      expect(indexedDBApplication.storage).toBeInstanceOf(IndexedDBMethod);

      const localStorageApplication = new Application(
        {
          storage: {
            type: "localStorage",
            name: "test",
            stores: {
              formData: "uuid, fullName, email, phoneNumber, numberOfFish, species, computedPrice, isDraft",
              species: "name, price",
              homebaseData: "KEY, REPORT_TYPE, SORT_KEY, TRIP_TYPE, VALUE",
            }
          }
        }
      )
      expect(localStorageApplication.storage).toBeInstanceOf(LocalStorageMethod);
    });
  });

  describe('logger config (a bad logger config must not brick app startup)', () => {
    it('does not throw on an unparseable maxSize; degrades to console-only logging', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let app;

      expect(() => {
        app = new Application({
          logger: {
            streams: { app: { level: 'info' } },
            indexedDB: { dbName: 'bad', maxSize: '5 megs' }, // unparseable
          },
        });
      }).not.toThrow();

      // logger still works for console output, but persistence is disabled
      expect(app.logger).toBeTruthy();
      expect(app.logger.persistence).toBeNull();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('builds a logger with persistence when the indexedDB config is valid', () => {
      const app = new Application({
        logger: {
          streams: { app: { level: 'info' } },
          indexedDB: { dbName: 'ok', maxSize: '5MB' },
        },
      });
      expect(app.logger).toBeTruthy();
      expect(app.logger.persistence).toBeTruthy();
    });
  });

  describe('service worker registration', () => {
    let register;

    beforeEach(() => {
      register = vi.fn().mockResolvedValue({ active: {} });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { register },
        configurable: true,
      });
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      delete navigator.serviceWorker;
      vi.restoreAllMocks();
    });

    const waitForReady = (app) =>
      new Promise((resolve) => app.on('ready', resolve));

    it('uses the browser default scope when none is configured', async () => {
      const app = new Application({
        serviceWorker: { url: '/my-app/service-worker.js' },
      });
      await waitForReady(app);

      expect(register).toHaveBeenCalledWith('/my-app/service-worker.js', undefined);
    });

    it('passes a configured scope to register()', async () => {
      const app = new Application({
        serviceWorker: { url: '/my-app/service-worker.js', scope: '/my-app/' },
      });
      await waitForReady(app);

      expect(register).toHaveBeenCalledWith('/my-app/service-worker.js', { scope: '/my-app/' });
    });

    it('does not register when no url is configured', async () => {
      const app = new Application({});
      await waitForReady(app);

      expect(register).not.toHaveBeenCalled();
    });
  });
});
