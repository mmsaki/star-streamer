const { sum } = require('../src/sum.js');

describe('Utils', () => {
	test('should add and return result', () => {
		expect(sum(1, 2)).toBe(3);
	});
});
