const { streamBytes } = require('../src/basic-stream');

describe('Utils', () => {
	test('should add and return result', () => {
		expect(sum(1, 2)).toBe(3);
	});
	test('should return same bytes', () => {
		const byteCount = 63614462;
		expect(streamBytes()).toBe(byteCount);
	});
});
