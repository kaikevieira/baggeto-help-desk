// Grafo de adjacência dos estados brasileiros (UFs)
// Fonte consolidada baseada em fronteiras interestaduais

export const UF_NEIGHBORS = {
  AC: ["AM", "RO"],
  AL: ["BA", "PE", "SE"],
  AM: ["AC", "PA", "RO", "RR", "MT"],
  AP: ["PA"],
  BA: ["AL", "SE", "ES", "MG", "GO", "PI", "PE", "TO"],
  CE: ["PI", "RN", "PB", "PE"],
  DF: ["GO"],
  ES: ["BA", "MG", "RJ"],
  GO: ["DF", "BA", "MG", "MS", "MT", "TO"],
  MA: ["PA", "TO", "PI"],
  MG: ["BA", "ES", "RJ", "SP", "MS", "GO", "BA"],
  MS: ["MT", "GO", "MG", "SP", "PR"],
  MT: ["AM", "RO", "GO", "MS", "PA", "TO"],
  PA: ["AP", "AM", "MT", "MA", "TO"],
  PB: ["RN", "CE", "PE"],
  PE: ["PB", "RN", "CE", "PI", "BA", "AL"],
  PI: ["MA", "TO", "BA", "PE", "CE"],
  PR: ["SP", "MS", "SC"],
  RJ: ["ES", "MG", "SP"],
  RN: ["CE", "PB"],
  RO: ["AC", "AM", "MT"],
  RR: ["AM"],
  RS: ["SC"],
  SC: ["RS", "PR"],
  SE: ["AL", "BA"],
  SP: ["RJ", "MG", "MS", "PR"],
  TO: ["PA", "MA", "PI", "BA", "GO", "MT"],
};

export function shortestPath(start, end) {
  if (!start || !end || start === end) return [start];
  const visited = new Set([start]);
  const queue = [[start]];
  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === end) return path;
    for (const nb of UF_NEIGHBORS[node] || []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }
  return [];
}
