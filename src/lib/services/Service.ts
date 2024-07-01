export class Service {
	private readonly _base: string;

	constructor(base: string) {
		this._base = base;
	}

	get baseURL() {
		return new URL(this._base, window.location.origin);
	}
}
