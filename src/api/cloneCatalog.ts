import { TAG_DOM_ELEMENT, TAG_UNIQUE_SYMBOL } from './const.ts';

type TUniqueInstanceTag = typeof TAG_DOM_ELEMENT | typeof TAG_UNIQUE_SYMBOL;
export type TCommonInstanceTag = (id: string) => string;

type ICatalogUniqueRecord = string;
interface ICatalogCommonRecord {
  name: string;
  seen: boolean;
}

export class UniqueLookupCatalog {
  #records: WeakMap<WeakKey, ICatalogUniqueRecord> = new WeakMap();
  #index = 0;

  lookup(key: WeakKey, tag: TUniqueInstanceTag) {
    let record = this.#records.get(key);
    if (record) {
      return record;
    }

    const id = index2Id(++this.#index);
    record = tag(id, <(Document | Element) & symbol> key);
    this.#records.set(key, record);

    return record;
  }
}

export class CommonLookupCatalog {
  #records: WeakMap<WeakKey, ICatalogCommonRecord> = new WeakMap();
  #index = 0;

  lookup(key: WeakKey, tag: TCommonInstanceTag) {
    let record = this.#records.get(key);
    if (record) {
      return record;
    }

    const id = index2Id(++this.#index);
    record = {
      name: tag(id),
      seen: false,
    };
    this.#records.set(key, record);

    return record;
  }
}

function index2Id(counter: number) {
  return counter.toString(16).padStart(4, '0');
}
