import { PathFinder } from "./PathFinder.js";

const svgNs = "http://www.w3.org/2000/svg";

export class PipeRenderer {
	static PIPE_WIDTH = 10; // Main pipe thickness
	static JOINT_WIDTH = 14; // Thicker joint/patch thickness
	static BEND_RADIUS = 16; // The tightness of the curve

	static drawPipe(start, startSide, end, endSide, obstacles) {
		const group = document.createElementNS(svgNs, "g");

		// 1. Get Manhattan Points
		const points = PathFinder.calculateRoute(start, startSide, end, endSide, obstacles);

		// 2. Generate Data
		// We need both the full path string (for the long straight pipes)
		// AND a list of specific curve commands (for the elbow patches)
		const { fullPath, elbows } = this.#generatePathData(points);

		// --- LAYER 1: The Long Pipe (Bottom Layer) ---

		// 1a. Shadow / Outline
		const outline = document.createElementNS(svgNs, "path");
		outline.setAttribute("d", fullPath);
		outline.setAttribute("stroke", "#374151"); // Dark Gray (Shadow)
		outline.setAttribute("stroke-width", String(this.PIPE_WIDTH + 2));
		outline.setAttribute("fill", "none");
		group.appendChild(outline);

		// 1b. Main Pipe Body
		const mainPipe = document.createElementNS(svgNs, "path");
		mainPipe.setAttribute("d", fullPath);
		mainPipe.setAttribute("stroke", "#6b7280"); // Standard Gray
		mainPipe.setAttribute("stroke-width", String(this.PIPE_WIDTH));
		mainPipe.setAttribute("fill", "none");
		group.appendChild(mainPipe);

		// --- LAYER 2: The Elbow "Patches" (Middle Layer) ---
		// These are drawn OVER the pipe at corners to look like fittings

		elbows.forEach((d) => {
			// The Fitting Body (Thicker than pipe)
			const elbow = document.createElementNS(svgNs, "path");
			elbow.setAttribute("d", d);
			elbow.setAttribute("stroke", "#9ca3af"); // Lighter Gray (looks like a connector)
			elbow.setAttribute("stroke-width", String(this.JOINT_WIDTH)); // Wider
			elbow.setAttribute("fill", "none");
			elbow.setAttribute("stroke-linecap", "butt"); // Clean edges
			group.appendChild(elbow);

			// The Fitting Shadow (Small outline for depth)
			const elbowShadow = document.createElementNS(svgNs, "path");
			elbowShadow.setAttribute("d", d);
			elbowShadow.setAttribute("stroke", "#374151");
			elbowShadow.setAttribute("stroke-width", String(this.JOINT_WIDTH + 2));
			elbowShadow.setAttribute("fill", "none");
			// Insert before the elbow body so it acts as border
			group.insertBefore(elbowShadow, elbow);
		});

		// --- LAYER 3: Highlights (Top Layer) ---
		// Adds glossy reflection to both pipe and elbows

		// Pipe Highlight
		const pipeHighlight = document.createElementNS(svgNs, "path");
		pipeHighlight.setAttribute("d", fullPath);
		pipeHighlight.setAttribute("stroke", "rgba(255,255,255,0.2)");
		pipeHighlight.setAttribute("stroke-width", String(this.PIPE_WIDTH / 3));
		pipeHighlight.setAttribute("fill", "none");
		group.appendChild(pipeHighlight);

		// Elbow Highlights (Brighter to pop out)
		elbows.forEach((d) => {
			const elHigh = document.createElementNS(svgNs, "path");
			elHigh.setAttribute("d", d);
			elHigh.setAttribute("stroke", "rgba(255,255,255,0.5)"); // Brighter
			elHigh.setAttribute("stroke-width", String(this.JOINT_WIDTH / 3));
			elHigh.setAttribute("fill", "none");
			group.appendChild(elHigh);
		});

		// 4. Draw End Flanges
		this.#drawFlange(group, points[0], startSide);
		this.#drawFlange(group, points[points.length - 1], endSide);

		return group;
	}

	static #generatePathData(points) {
		if (points.length < 2) return { fullPath: "", elbows: [] };

		let fullPath = `M ${points[0].x} ${points[0].y}`;
		const elbows = [];
		const r = this.BEND_RADIUS;

		for (let i = 1; i < points.length - 1; i++) {
			const prev = points[i - 1];
			const curr = points[i]; // The Corner
			const next = points[i + 1];

			// 1. Calculate Geometry
			const distPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
			const distNext = Math.hypot(next.x - curr.x, next.y - curr.y);
			const effectiveR = Math.min(r, distPrev / 2, distNext / 2);

			// Directions
			const dirX_in = Math.sign(curr.x - prev.x);
			const dirY_in = Math.sign(curr.y - prev.y);
			const dirX_out = Math.sign(next.x - curr.x);
			const dirY_out = Math.sign(next.y - curr.y);

			// Curve Start/End points
			const startCurveX = curr.x - dirX_in * effectiveR;
			const startCurveY = curr.y - dirY_in * effectiveR;
			const endCurveX = curr.x + dirX_out * effectiveR;
			const endCurveY = curr.y + dirY_out * effectiveR;

			// 2. Append to Main Path
			fullPath += ` L ${startCurveX} ${startCurveY}`;
			fullPath += ` Q ${curr.x} ${curr.y} ${endCurveX} ${endCurveY}`;

			// 3. Create Isolated Elbow Path
			// slightly extended curve to ensure it covers the joint fully
			const elbowPath = `M ${startCurveX} ${startCurveY} Q ${curr.x} ${curr.y} ${endCurveX} ${endCurveY}`;
			elbows.push(elbowPath);
		}

		fullPath += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

		return { fullPath, elbows };
	}

	static #drawFlange(group, point, side) {
		const rect = document.createElementNS(svgNs, "rect");
		const size = this.PIPE_WIDTH + 6;
		const thickness = 5;

		let x = point.x - size / 2;
		let y = point.y - size / 2;
		let w = size;
		let h = size;

		if (side === "left" || side === "right") {
			w = thickness;
			x = side === "left" ? point.x : point.x - thickness;
		} else {
			h = thickness;
			y = side === "top" ? point.y : point.y - thickness;
		}

		rect.setAttribute("x", String(x));
		rect.setAttribute("y", String(y));
		rect.setAttribute("width", String(w));
		rect.setAttribute("height", String(h));
		rect.setAttribute("rx", String(2));
		rect.setAttribute("fill", "#4b5563");
		rect.setAttribute("stroke", "#1f2937");
		group.appendChild(rect);
	}
}
