export function prepareValuesForHSet(valuesObject: object) {
  return Object.assign(
    {},
    ...Object.entries(valuesObject).map(([k, v]) => {
      if (typeof v !== 'string') {
        return { [k]: JSON.stringify(v) };
      }
      return { [k]: v };
    }),
  );
}

export function parseValues(valuesObject: object) {
  return Object.assign(
    {},
    ...Object.entries(valuesObject).map(([k, v]) => {
      if (typeof v === 'string') {
        return { [k]: JSON.parse(v) };
      }
      return { [k]: v };
    }),
  );
}
