export function nanoid(size = 10) {
	const bytes = crypto.getRandomValues(new Uint8Array(size));
	return Array.from(bytes, (b) =>
		(b & 63) < 36 ? b.toString(36) : (b & 63) < 62 ? (b & 63) - 36 + "A".charCodeAt(0) : (b & 63) === 62 ? "_" : "-"
	).join("");
}
