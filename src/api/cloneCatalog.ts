export type TCommonInstanceTag = (id: string) => string;

type ICatalogUniqueRecord = string;
interface ICatalogCommonRecord {
  name: string;
  seen: boolean;
}

export class UniqueLookupCatalog {
  #records: WeakMap<WeakKey, ICatalogUniqueRecord> = new WeakMap();
  #index = 0;

  lookup<
    TMapKey extends WeakKey,
    TTagFn extends (id: string, value: TMapKey) => string,
  >(key: TMapKey, tag: TTagFn): string {
    return this.#records.getOrInsertComputed(key, () => {
      const id = index2Id(++this.#index);

      return tag(id, key);
    });
  }
}

export class CommonLookupCatalog {
  #records: WeakMap<WeakKey, ICatalogCommonRecord> = new WeakMap();
  #index = 0;

  lookup(key: WeakKey, tag: TCommonInstanceTag) {
    return this.#records.getOrInsertComputed(key, () => {
      const id = index2Id(++this.#index);

      return { name: tag(id), seen: false };
    });
  }
}

function index2Id(counter: number) {
  return counter.toString(16).padStart(4, '0');
}
