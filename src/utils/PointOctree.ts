import * as THREE from 'three';

// --- BEGINNING OF PointOctree --- 
// This section now contains a more complete Point Octree implementation.
export interface IPointOctree {
    findClosestPoint(target: THREE.Vector3): THREE.Vector3 | null;
}

export class PointOctreeNode {
    bounds: THREE.Box3;
    points: THREE.Vector3[] = [];
    children: PointOctreeNode[] | null = null;
    capacity: number;

    constructor(bounds: THREE.Box3, capacity: number) {
        this.bounds = bounds;
        this.capacity = capacity;
    }

    isLeaf(): boolean {
        return this.children === null;
    }

    insert(point: THREE.Vector3): boolean {
        if (!this.bounds.containsPoint(point)) {
            return false; // Point is outside this node's bounds
        }

        if (this.isLeaf() && this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (this.isLeaf()) { // Implies this.points.length >= this.capacity or it's time to subdivide
            this.subdivide();
        }

        // After subdivision (or if already subdivided), try to insert into children
        for (const child of this.children!) { // children should exist now
            if (child.insert(point)) {
                return true;
            }
        }
        // If point couldn't be inserted into any child (e.g. on a boundary, or children are full at their level)
        // This indicates a potential issue or a point that truly doesn't fit deeper.
        // For this implementation, we don't store it in the parent if it's a new insertion attempt into a non-leaf.
        return false; 
    }

    subdivide(): void {
        if (!this.isLeaf()) return; // Already subdivided

        const center = new THREE.Vector3();
        this.bounds.getCenter(center);
        const min = this.bounds.min;
        const max = this.bounds.max;

        // Use a safe center for subdivision to handle potentially flat dimensions
        const safeCenter = new THREE.Vector3(
            (min.x === max.x) ? min.x : center.x,
            (min.y === max.y) ? min.y : center.y,
            (min.z === max.z) ? min.z : center.z
        );

        const childBoundDefs = [
            { min: min.clone(), max: safeCenter.clone() },
            { min: new THREE.Vector3(safeCenter.x, min.y, min.z), max: new THREE.Vector3(max.x, safeCenter.y, safeCenter.z) },
            { min: new THREE.Vector3(min.x, min.y, safeCenter.z), max: new THREE.Vector3(safeCenter.x, safeCenter.y, max.z) },
            { min: new THREE.Vector3(safeCenter.x, min.y, safeCenter.z), max: new THREE.Vector3(max.x, safeCenter.y, max.z) },
            { min: new THREE.Vector3(min.x, safeCenter.y, min.z), max: new THREE.Vector3(safeCenter.x, max.y, safeCenter.z) },
            { min: new THREE.Vector3(safeCenter.x, safeCenter.y, min.z), max: new THREE.Vector3(max.x, max.y, safeCenter.z) },
            { min: new THREE.Vector3(min.x, safeCenter.y, safeCenter.z), max: new THREE.Vector3(safeCenter.x, max.y, max.z) },
            { min: safeCenter.clone(), max: max.clone() }
        ];
        
        this.children = [];
        for(const def of childBoundDefs) {
            this.children.push(new PointOctreeNode(new THREE.Box3(def.min, def.max), this.capacity));
        }

        const oldPoints = this.points;
        this.points = []; // Clear points from this node as it's no longer a leaf (ideally)

        for (const point of oldPoints) {
            let insertedSuccessfully = false;
            for (const child of this.children) {
                if (child.insert(point)) {
                    insertedSuccessfully = true;
                    break;
                }
            }
            if (!insertedSuccessfully) {
                // Fallback: if a point from this node couldn't be re-inserted into any child,
                // keep it in this (now parent) node. This makes the Octree more robust.
                this.points.push(point); 
            }
        }
    }

    _findClosestPointRecursive(target: THREE.Vector3, bestMatch: { point: THREE.Vector3 | null, distanceSq: number }): void {
        // Check points in the current node first
        for (const point of this.points) {
            const distSq = target.distanceToSquared(point);
            if (distSq < bestMatch.distanceSq) {
                bestMatch.distanceSq = distSq;
                bestMatch.point = point;
            }
        }

        if (this.isLeaf()) {
            return; // No children to explore
        }

        // If not a leaf, sort children by distance and explore them
        const sortedChildrenData = this.children!
            .map(child => ({
                child,
                distToBoxSq: child.bounds.distanceToPoint(target) ** 2 
            }))
            .sort((a, b) => a.distToBoxSq - b.distToBoxSq);

        for (const { child, distToBoxSq } of sortedChildrenData) {
            if (distToBoxSq >= bestMatch.distanceSq) {
                continue; // Prune this branch
            }
            child._findClosestPointRecursive(target, bestMatch);
        }
    }
}

export class PointOctree implements IPointOctree {
    private root: PointOctreeNode;
    private static readonly DEFAULT_CAPACITY = 8; 
    private static readonly MIN_BOUNDS_SIZE = 1e-5; // Minimum size for a dimension

    constructor(points: THREE.Vector3[], worldBox?: THREE.Box3, capacity?: number) {
        let boundingBox = worldBox;
        if (!boundingBox) {
            boundingBox = new THREE.Box3();
            if (points && points.length > 0) {
                boundingBox.setFromPoints(points);
            } else {
                boundingBox.min.set(-1, -1, -1); // Default box if no points
                boundingBox.max.set(1, 1, 1);
            }
        }
        
        // Ensure the bounding box has some volume to prevent issues with flat/empty boxes.
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center); // Store center before modifying min/max

        if (size.x < PointOctree.MIN_BOUNDS_SIZE) {
            boundingBox.min.x = center.x - PointOctree.MIN_BOUNDS_SIZE / 2;
            boundingBox.max.x = center.x + PointOctree.MIN_BOUNDS_SIZE / 2;
        }
        if (size.y < PointOctree.MIN_BOUNDS_SIZE) {
            boundingBox.min.y = center.y - PointOctree.MIN_BOUNDS_SIZE / 2;
            boundingBox.max.y = center.y + PointOctree.MIN_BOUNDS_SIZE / 2;
        }
        if (size.z < PointOctree.MIN_BOUNDS_SIZE) {
            boundingBox.min.z = center.z - PointOctree.MIN_BOUNDS_SIZE / 2;
            boundingBox.max.z = center.z + PointOctree.MIN_BOUNDS_SIZE / 2;
        }

        this.root = new PointOctreeNode(boundingBox, capacity || PointOctree.DEFAULT_CAPACITY);

        if (points) {
            for (const point of points) {
                this.root.insert(point);
            }
        }
    }

    findClosestPoint(target: THREE.Vector3): THREE.Vector3 | null {
        const bestMatch = {
            point: null as THREE.Vector3 | null,
            distanceSq: Infinity,
        };
        
        this.root._findClosestPointRecursive(target, bestMatch);
        return bestMatch.point;
    }
}
// --- END OF PointOctree ---