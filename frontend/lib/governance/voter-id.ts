export function getVoterId(): string {
  if (typeof window !== 'undefined') {
    let voterId = localStorage.getItem('governance_voter_id');
    if (!voterId) {
      voterId = `voter_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('governance_voter_id', voterId);
    }
    return voterId;
  }
  return `voter_${Date.now()}`;
}
