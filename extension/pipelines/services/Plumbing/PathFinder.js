export class PathFinder {
	static calculateRoute(start, startSide, end, endSide, obstacles) {
		// Offset away from the node to ensure pipe exits cleanly
		const exitLen = 30;

		const p1 = { ...start };
		const p4 = { ...end };

		// P2: Exit point from Source
		const p2 = { ...p1 };
		switch (startSide) {
			case "top":
				p2.y -= exitLen;
				break;
			case "bottom":
				p2.y += exitLen;
				break;
			case "left":
				p2.x -= exitLen;
				break;
			case "right":
				p2.x += exitLen;
				break;
		}

		// P3: Entry point to Target
		const p3 = { ...p4 };
		switch (endSide) {
			case "top":
				p3.y -= exitLen;
				break;
			case "bottom":
				p3.y += exitLen;
				break;
			case "left":
				p3.x -= exitLen;
				break;
			case "right":
				p3.x += exitLen;
				break;
		}

		// Calculate intermediate Manhattan corners between p2 and p3
		const corners = this.#getManhattanCorners(p2, p3, startSide);
		return [p1, p2, ...corners, p3, p4];
	}

	static #getManhattanCorners(pStart, pEnd, orientation) {
		const midX = (pStart.x + pEnd.x) / 2;
		const midY = (pStart.y + pEnd.y) / 2;

		// Simple heuristic: Try to maintain direction of start
		const isHorizontalStart = orientation === "left" || orientation === "right";

		if (isHorizontalStart) {
			// Move Horizontally to midX, then Vertically to pEnd.y
			return [
				{ x: midX, y: pStart.y },
				{ x: midX, y: pEnd.y },
			];
		} else {
			// Move Vertically to midY, then Horizontally to pEnd.x
			return [
				{ x: pStart.x, y: midY },
				{ x: pEnd.x, y: midY },
			];
		}
	}

	// Helper for drag preview
	static generateSimplePath(x1, y1, x2, y2, startSide) {
		// Simplified Z-path for dragging preview
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;

		if (startSide === "left" || startSide === "right")
			return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
		else return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
	}
}
