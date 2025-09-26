export const validate =
  (schema) =>
  (req, _res, next) => {
    try {
      const data = {
        body: req.body,
        params: req.params,
        query: req.query
      };
      schema.parse(data);
      next();
    } catch (e) {
      e.status = 400;
      next(e);
    }
  };
