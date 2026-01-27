import { NarrativeCluster, NarrativeSignal } from './narrative.types';

export function generateSignal(cluster: NarrativeCluster): NarrativeSignal {
  const signalType = cluster.growthRate > 20 ? 'HEATING_UP' : 'COOLING_DOWN';
  return {
    clusterId: cluster.id,
    clusterName: cluster.name,
    signalType,
    strength: Math.min(Math.abs(cluster.growthRate), 100),
    topTokens: cluster.tokens.slice(0, 3).map(t => t.symbol),
    message: `${cluster.name} sector is ${signalType === 'HEATING_UP' ? 'gaining' : 'losing'} momentum`,
    timestamp: new Date().toISOString(),
  };
}
