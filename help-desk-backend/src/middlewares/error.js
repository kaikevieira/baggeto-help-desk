export function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'Error',
    message: err.message || 'Erro interno'
  });
}
