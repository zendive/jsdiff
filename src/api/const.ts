export const TAG = {
  EXCEPTION: '⁉️(exception)',
  VALUE_HAD_EXCEPTION: (str: string) => `⁉️(${str})`,
  VALUE_IS_EMPTY: '(empty)',
  VALUE_IS_UNDEFINED: '(undefined)',
  VALUE_IS_NULL: '(null)',
  VALUE_IS_REOCCURING_ARRAY: (id: string) => `♻️(recurring [0x${id}])`,
  VALUE_IS_REOCCURING_OBJECT: (id: string) => `♻️(recurring {0x${id}})`,
  IS_SYMBOL: (name: string, id: string) => `${name} 0x${id}`,
  VALUE_IS_NATIVE_FUNCTION: '𝑓(native)',
  VALUE_IS_FUCNTION: (hash: string) => `𝑓(${hash})`,
};
