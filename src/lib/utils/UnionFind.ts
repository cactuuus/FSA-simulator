/**
 * A Union-Find (Disjoint Set Union) data structure for efficiently merging disjoint sets.
 */
export class UnionFind {
	private parent = new Map<string, string>();

	/**
	 * Finds the representative (root) of the set that the given ID belongs to, with path compression.
	 * Note: path compression essentially optimizes the parent map as we go, by updating each node to point directly to the root representative, which speeds up future find operations.
	 * @param id The ID for which to find the representative (root).
	 * @returns The representative (root) of the set containing the given ID.
	 */
	find(id: string): string {
		if (!this.parent.has(id)) this.parent.set(id, id);
		if (this.parent.get(id) !== id) {
			// path compression step
			this.parent.set(id, this.find(this.parent.get(id)!));
		}
		return this.parent.get(id)!;
	}

	/**
	 * Merges the sets containing 'a' and 'b' by making the representative (root) of one point to the representative of the other.
	 */
	union(a: string, b: string): void {
		this.parent.set(this.find(a), this.find(b));
	}

	/**
	 * Groups the IDs by their representative (root) and returns a mapping from each representative to the list of IDs in its set.
	 * @returns A map from each representative to all IDs in its set.
	 */
	groups(): Map<string, string[]> {
		const groupMap = new Map<string, string[]>();
		for (const id of this.parent.keys()) {
			const representative = this.find(id);
			if (!groupMap.has(representative)) groupMap.set(representative, []);
			groupMap.get(representative)!.push(id);
		}
		return groupMap;
	}
}
