export const MongoIdType = "MongoId";
export const StringType = "String";
export const IntType = "Int";
export const FloatType = "Float";
export const DateType = "Date";
export const arrayOf = type => {
  return {
    __isArray: true,
    type
  };
};
export const objectOf = type => {
  return {
    __isObject: true,
    type
  };
};
export const typeLiteral = type => {
  return {
    __isLiteral: true,
    type
  };
};

export const formattedDate = options => {
  return {
    ...options,
    __isDate: true
  };
};
