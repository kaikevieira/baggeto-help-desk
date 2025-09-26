// Middleware genérico para Zod (NÃO reatribui req.query/body/params)
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues?.[0];
    return res.status(400).json({ message: issue?.message || "Payload inválido" });
  }

  // Mescla nos objetos existentes (evita "only a getter")
  if (parsed.data.body)   Object.assign(req.body, parsed.data.body);
  if (parsed.data.params) Object.assign(req.params, parsed.data.params);
  if (parsed.data.query)  Object.assign(req.query, parsed.data.query);

  next();
};
