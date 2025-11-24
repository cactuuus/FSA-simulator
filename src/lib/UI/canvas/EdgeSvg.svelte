<script lang="ts">
	import { Node, Edge } from '$lib/fsa';

	const { edge, isSelected }: { edge: Edge; isSelected: boolean } = $props();

	function calculateArcPath(edge: Edge): string {
		// todo -- update loopback
		if (edge.isLoopback()) {
			return `M ${edge.sourcePoint.x - 30} ${edge.sourcePoint.y + 30}
            A 40 40, 0, 1, 0, ${edge.sourcePoint.x + 30} ${edge.sourcePoint.y + 30}
            L ${edge.sourcePoint.x} ${edge.sourcePoint.y}`;
		}

		const dx = edge.targetPoint.x - edge.sourcePoint.x;
		const dy = edge.targetPoint.y - edge.sourcePoint.y;
		const distance = Math.sqrt(dx ** 2 + dy ** 2);

		// straight line
		if (edge.curvature === 0) {
			const totalDistance = distance - 2 * Node.RADIUS;
			const startRatio = Node.RADIUS / distance;
			const endRatio = (distance - Node.RADIUS) / distance;
			const startX = edge.sourcePoint.x + dx * startRatio;
			const startY = edge.sourcePoint.y + dy * startRatio;
			const endX = edge.sourcePoint.x + dx * endRatio;
			const endY = edge.sourcePoint.y + dy * endRatio;
			return `M ${startX} ${startY} L ${endX} ${endY}`;
		}

		// arc TO center
		const h = Math.abs(edge.curvature);
		const maxEffectiveCurvature = distance / 2;
		const clampedH = Math.min(h, maxEffectiveCurvature);
		const radius = ((distance * distance) / 4 + clampedH ** 2) / (2 * clampedH);

		// arc center
		const midX = (edge.sourcePoint.x + edge.targetPoint.x) / 2;
		const midY = (edge.sourcePoint.y + edge.targetPoint.y) / 2;
		const perpX = -dy / distance;
		const perpY = dx / distance;
		const centerOffset = Math.sqrt(radius ** 2 - (distance / 2) ** 2);
		const centerDirection = edge.curvature > 0 ? 1 : -1;
		const centerX = midX + perpX * centerOffset * centerDirection;
		const centerY = midY + perpY * centerOffset * centerDirection;

		// angles
		const angleToSource = Math.atan2(edge.sourcePoint.y - centerY, edge.sourcePoint.x - centerX);
		const angleToTarget = Math.atan2(edge.targetPoint.y - centerY, edge.targetPoint.x - centerX);

		// calculate the angle to shorten by (arc length = radius * angle)
		const angleToRemove = Node.RADIUS / radius;

		// new endpoint angle
		let sweepFlag, newTargetAngle, newSourceAngle;
		if (edge.curvature > 0) {
			sweepFlag = 1;
			newTargetAngle = angleToTarget - angleToRemove;
			newSourceAngle = angleToSource + angleToRemove;
		} else {
			sweepFlag = 0;
			newTargetAngle = angleToTarget + angleToRemove;
			newSourceAngle = angleToSource - angleToRemove;
		}

		// calculate new start/end point
		const startX = centerX + radius * Math.cos(newSourceAngle);
		const startY = centerY + radius * Math.sin(newSourceAngle);
		const endX = centerX + radius * Math.cos(newTargetAngle);
		const endY = centerY + radius * Math.sin(newTargetAngle);

		return `M ${startX} ${startY}
        	A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY}`;
	}

	const shape = $derived(calculateArcPath(edge));

	const labelPosition = $derived(
		edge.isLoopback()
			? { x: edge.sourcePoint.x, y: edge.sourcePoint.y + Node.RADIUS + 80 }
			: {
					x: (edge.sourcePoint.x + edge.targetPoint.x) / 2,
					y: (edge.sourcePoint.y + edge.targetPoint.y) / 2
				}
	);

	const labelOffset = 4;
	const textSpacing = 20;
</script>

<g data-id={edge.id} class="edge selectable {isSelected ? 'selected' : ''}">
	<defs>
		<!-- A marker to be used as an arrowhead -->
		<marker
			id="arrow-{edge.id}"
			viewBox="0 0 10 10"
			refX="10"
			refY="5"
			markerWidth="7"
			markerHeight="7"
			orient="auto-start-reverse"
			stroke="none"
			fill="currentColor"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" />
		</marker>
	</defs>

	<path d={shape} class="edge-path" marker-end="url(#arrow-{edge.id})" />

	<text class="edge-label" x={labelPosition.x} y={labelPosition.y}>
		{#each edge.label as label, index}
			<tspan x={labelPosition.x} dy={index === 0 ? labelOffset : textSpacing}>
				{label}
			</tspan>
		{/each}
	</text>

	<!-- hidden, thicker path, used for easier selection -->
	<path d={shape} class="select-area" />
</g>
