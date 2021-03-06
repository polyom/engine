export class Random {
	constructor(
		public a: number,
		public b: number,
		public c: number,
		public d: number
	) {}

	number() {
		this.a >>>= 0;
		this.b >>>= 0;
		this.c >>>= 0;
		this.d >>>= 0;
		let t = (this.a + this.b) | 0;
		this.a = this.b ^ (this.b >>> 9);
		this.b = (this.c + (this.c << 3)) | 0;
		this.c = (this.c << 21) | (this.c >>> 11);
		this.d = (this.d + 1) | 0;
		t = (t + this.d) | 0;
		this.c = (this.c + t) | 0;
		return (t >>> 0) / 4294967296;
	}

	shuffle<T>(array: IterableIterator<T>): T[] {
		return [...array].sort(() => this.number() - 0.5);
	}
}
