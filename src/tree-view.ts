import { createStore, createEvent, Store } from 'effector';
import { h, spec, list, variant } from 'forest';
import { Options } from './types.h';

type StoreDescriptor = { store: Store<any>; mapped: boolean };
type StoresMap = Store<Map<string, StoreDescriptor>>;

const trimDomain = (domainName: string | undefined, name: string): string =>
  domainName ? name.replace(domainName + '/', '') : name;

export function TreeView($stores: StoresMap, options: Options): void {
  h('ul', () => {
    spec({ style: styles.list });

    list(
      $stores.map((map) => [...map.entries()]),
      ({ store }) => {
        const storeValue = store.map(([, value]) => value).getState();
        const $storeName = store.map(([name]) =>
          trimDomain(options.trimDomain, name),
        );
        const $isExpanded = createStore(false);
        const expandToggle = createEvent<any>();

        $isExpanded.on(expandToggle, (is) => !is);

        JsonNode($storeName, storeValue);
      },
    );
  });
}

function JsonNode($storeName: Store<string>, value: StoreDescriptor) {
  const $type = value
    ? value.store.map((object) => ({ type: getObjectType(object) }))
    : createStore({ type: '' });

  h('li', () => {
    spec({ style: styles.node });

    h('pre', { text: $storeName, style: styles.nodeTitle });
    h('pre', { text: ': ', style: styles.nodeTitle });

    return;

    variant({
      source: $type,
      key: 'type',
      cases: {
        Object() {
          JsonObject(value.store);
        },
        Error() {
          JsonObject(value.store);
        },
        WeakMap() {
          JsonObject(value.store);
        },
        WeakSet() {
          JsonObject(value.store);
        },
        Array() {
          JsonArray(value.store);
        },
        Iterable() {
          JsonIterable(value.store);
        },
        Map() {
          JsonIterable(value.store);
        },
        Set() {
          JsonIterable(value.store);
        },
        String() {
          JsonValue(value.store, (raw) =>
            typeof raw === 'string' ? `"${raw}"` : '',
          );
        },
        Number() {
          JsonValue(value.store);
        },
        Boolean() {
          JsonValue(value.store, (raw) => (raw ? 'true' : 'false'));
        },
        Date() {
          JsonValue(value.store, (raw) => raw?.toISOString?.());
        },
        Null() {
          JsonValue(value.store, () => 'null');
        },
        Undefined() {
          JsonValue(value.store, () => 'undefined');
        },
        Function() {
          JsonValue(value.store, (raw) => raw?.toString?.());
        },
        Symbol() {
          JsonValue(value.store, (raw) => raw?.toString?.());
        },
      },
    });
  });
}

function JsonValue<T>($value: Store<T>, getter = (raw: T) => String(raw)) {
  h('pre', () => {
    spec({ text: $value.map(getter), style: styles.nodeContent });
  });
}

function JsonObject<T extends {}>($value: Store<T>) {
  h('pre', {
    text: $value.map((value) => JSON.stringify(value)),
    style: styles.nodeContent,
  });
}

function JsonArray<T extends {}>($value: Store<T>) {
  h('pre', {
    text: $value.map((value) => JSON.stringify(value)),
    style: styles.nodeContent,
  });
}

function JsonIterable<T extends {}>($value: Store<T>) {
  h('pre', {
    text: $value.map((value) => JSON.stringify(value)),
    style: styles.nodeContent,
  });
}

function getObjectType(obj: any): string {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  if (type === 'Object' && typeof obj[Symbol.iterator] === 'function') {
    return 'Iterable';
  }

  if (
    type === 'Custom' &&
    obj.constructor !== Object &&
    obj instanceof Object
  ) {
    // For projects implementing objects overriding `.prototype[Symbol.toStringTag]`
    return 'Object';
  }

  return type;
}

const styles = {
  list: {
    listStyleType: 'none',
    margin: '0 0',
    padding: '0 0',
  },
  node: {
    display: 'flex',
    padding: '0.5rem 1rem',
    margin: '0 0',
  },
  nodeTitle: {
    display: 'flex',
    margin: '0 0',
  },
  nodeContent: {
    margin: '0 0',
  },
};
