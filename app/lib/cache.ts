// cache.js
import NodeCache from 'node-cache';

let cacheInstance: any;

export function getCacheInstance() {
  if (!cacheInstance) {
    cacheInstance = new NodeCache({ stdTTL: 86400 }); // Cache with TTL of 24 hours
  }
  return cacheInstance;
}