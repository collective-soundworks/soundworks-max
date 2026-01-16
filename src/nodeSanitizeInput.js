function nodeSanitizeInput(key, def, ...value) {
  if (value.length === 1) {
    value = value[0];
  }

  let sanitizedValue = null;

  // parse max null
  if (value === 'null') {
    value = null;
  }

  switch (def.type) {
    case 'boolean': {
      if (value === 1) {
        sanitizedValue = true;
      } else if (value == 0) {
        sanitizedValue = false;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else if (value == 'bang') {
        sanitizedValue = true;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: boolean`);
      }
      break;
    }
    case 'integer': {
      if (Number.isInteger(value)) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: integer`);
      }

      break;
    }
    case 'float': {
      if (Number.isFinite(value)) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: float`);
      }
      break;
    }
    case 'string': {
      if (typeof value === 'string' || value instanceof String) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: string`);
      }
      break;
    }
    case 'enum': {
      let { list } = def;

      if (list.indexOf(value) !== -1) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: enum`);
      }
      break;
    }
    case 'any': {
      if (!def.nullable && value === null) {
        throw new Error(`Invalid value ${value} for param ${key} - type: any`);
      } else {
        sanitizedValue = value;
      }
      break;
    }
    default: {
      sanitizedValue = value;
      break;
    }
  }

  if (def.nullable === false && sanitizedValue === null) {
    throw new Error(`Failed to sanitize ${value} to ${def.type}`);
  }

  return sanitizedValue;
}


module.exports = nodeSanitizeInput;