export const TWO_POW_10 = 1024;
export const TWO_POW_MINUS_14 = Math.pow(2, -14);

export function getCharCodes(str: string) {
	let codes = new Uint8Array(str.length);

	for (var i = 0, length = str.length; i < length; i++) {
		codes[i] = str.charCodeAt(i) & 0xff;
	}
	return codes;
}

type BinaryReaderBuffer = BinaryReader | Uint8Array | ArrayBuffer | string | number | ArrayLike<number>;

export class BinaryReader {
	#dataView: DataView = new DataView(new ArrayBuffer(0));
	#byteOffset = 0;
	#littleEndian;
	constructor(buffer: BinaryReaderBuffer, byteOffset?: number | undefined, byteLength?: number | undefined, littleEndian = true) {
		this.#littleEndian = littleEndian;
		this.#initDataview(buffer, byteOffset, byteLength);
	}

	#initDataview(buffer: BinaryReaderBuffer, byteOffset: number | undefined, byteLength: number | undefined) {
		switch (true) {
			case buffer instanceof BinaryReader:
				this.#dataView = new DataView(buffer.buffer, byteOffset ? byteOffset + buffer.#dataView.byteOffset : buffer.#dataView.byteOffset, byteLength);
				break;
			case buffer instanceof Uint8Array || buffer?.constructor?.name === 'Uint8Array':
				this.#dataView = new DataView((buffer as Uint8Array).buffer, byteOffset ? byteOffset + (buffer as Uint8Array).byteOffset : (buffer as Uint8Array).byteOffset, byteLength);
				break;
			case buffer instanceof ArrayBuffer || buffer?.constructor?.name === 'ArrayBuffer':
				this.#dataView = new DataView((buffer as ArrayBuffer), byteOffset, byteLength);
				break;
			case typeof buffer === 'string':
				this.#dataView = new DataView(getCharCodes(buffer).buffer, byteOffset, byteLength);
				break;
			case typeof buffer === 'number':
				this.#dataView = new DataView(new Uint8Array(buffer).buffer, byteOffset, byteLength);
				break;
			case Array.isArray(buffer):
				this.#dataView = new DataView(Uint8Array.from(buffer).buffer, byteOffset, byteLength);
				break;
			default:
				console.error(`Unknow buffer type : ${buffer}`);
				break;
		}
	}

	get buffer() {
		return this.#dataView.buffer;
	}

	get byteLength() {
		return this.#dataView.byteLength;
	}

	getDataView() {
		return this.#dataView;
	}

	tell() {
		return this.#byteOffset;
	}

	seek(byteOffset = this.#byteOffset) {
		// /_checkBounds
		this.#byteOffset = byteOffset;
	}

	skip(byteLength = 0) {
		// /_checkBounds
		this.#byteOffset += byteLength;
	}

	getString(byteLength: number, byteOffset = this.#byteOffset) {
		let string = '';
		let readBuffer = new Uint8Array(this.buffer, byteOffset + this.#dataView.byteOffset, byteLength);
		// /_checkBounds
		this.#byteOffset = byteOffset + byteLength;
		for (var i = 0; i < byteLength; i++) {
			string += String.fromCharCode(readBuffer[i]);
		}
		return string;
	}

	getNullString(byteOffset = this.#byteOffset) {
		let string = '';
		let readBuffer = new Uint8Array(this.buffer, this.#dataView.byteOffset);

		this.#byteOffset = byteOffset;
		let c;
		do {
			c = String.fromCharCode(readBuffer[this.#byteOffset++]);
			if (c == '\0') {
			} else {
				string += c;
			}
		} while (c != '\0');
		return string;
	}

	setString(str: string, byteOffset = this.#byteOffset) {
		let length = str.length;
		this.#byteOffset = byteOffset + length;
		let writeBuffer = new Uint8Array(this.buffer, byteOffset + this.#dataView.byteOffset, length);
		//TODO: check len

		for (var i = 0, l = length; i < l; i++) {
			writeBuffer[i] = str.charCodeAt(i) & 0xff;
		}
	}

	getBytes(byteLength: number, byteOffset = this.#byteOffset) {
		let readBuffer = new Uint8Array(this.buffer, byteOffset + this.#dataView.byteOffset, byteLength);
		this.#byteOffset = byteOffset + byteLength;
		return readBuffer;
	}

	getInt8(byteOffset = this.#byteOffset) {
		this.#byteOffset = byteOffset + 1;
		return this.#dataView.getInt8(byteOffset);
	}

	getUint8(byteOffset = this.#byteOffset) {
		this.#byteOffset = byteOffset + 1;
		return this.#dataView.getUint8(byteOffset);
	}

	getInt16(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 2;
		return this.#dataView.getInt16(byteOffset, littleEndian);
	}

	getUint16(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 2;
		return this.#dataView.getUint16(byteOffset, littleEndian);
	}

	getFloat16(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {//TODOv3: optimize this function
		//TODO: fix endianness
		this.#byteOffset = byteOffset + 2;

		let readBuffer = new Uint8Array(this.buffer, byteOffset + this.#dataView.byteOffset, 2);//TODOv3: optimize
		let b = readBuffer;//this._getBytes(2, byteOffset, littleEndian);

		let sign = b[1] >> 7;
		let exponent = ((b[1] & 0x7C) >> 2);
		let mantissa = ((b[1] & 0x03) << 8) | b[0];

		if (exponent == 0) {
			return (sign ? -1 : 1) * TWO_POW_MINUS_14 * (mantissa / TWO_POW_10);
		} else if (exponent == 0x1F) {
			return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
		}

		return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + (mantissa / TWO_POW_10));
	}

	getInt32(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 4;
		return this.#dataView.getInt32(byteOffset, littleEndian);
	}

	getUint32(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 4;
		return this.#dataView.getUint32(byteOffset, littleEndian);
	}

	getFloat32(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 4;
		return this.#dataView.getFloat32(byteOffset, littleEndian);
	}

	getBigInt64(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 8;
		return this.#dataView.getBigInt64(byteOffset, littleEndian);
	}

	getBigUint64(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 8;
		return this.#dataView.getBigUint64(byteOffset, littleEndian);
	}

	getFloat64(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 8;
		return this.#dataView.getFloat64(byteOffset, littleEndian);
	}

	getVector2(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian, vec = new Float32Array(2)) {
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	getVector3(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian, vec = new Float32Array(3)) {
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		vec[2] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	getVector4(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian, vec = new Float32Array(4)) {
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		vec[2] = this.getFloat32(undefined, littleEndian);
		vec[3] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	getVector48(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian, vec = new Float32Array(3)) {
		vec[0] = this.getFloat16(byteOffset, littleEndian);
		vec[1] = this.getFloat16(undefined, littleEndian);
		vec[2] = this.getFloat16(undefined, littleEndian);
		return vec;
	}

	getQuaternion(byteOffset = this.#byteOffset, littleEndian = this.#littleEndian, vec = new Float32Array(4)) {
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		vec[2] = this.getFloat32(undefined, littleEndian);
		vec[3] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	setBigInt64(value: bigint, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 8;
		return this.#dataView.setBigInt64(byteOffset, value, littleEndian);
	}

	setBigUint64(value: bigint, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 8;
		return this.#dataView.setBigUint64(byteOffset, value, littleEndian);
	}

	setFloat32(value: number, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 4;
		return this.#dataView.setFloat32(byteOffset, value, littleEndian);
	}

	setFloat64(value: number, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 8;
		return this.#dataView.setFloat64(byteOffset, value, littleEndian);
	}

	setInt8(value: number, byteOffset = this.#byteOffset) {
		this.#byteOffset = byteOffset + 1;
		return this.#dataView.setInt8(byteOffset, value);
	}

	setInt16(value: number, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 2;
		return this.#dataView.setInt16(byteOffset, value, littleEndian);
	}

	setInt32(value: number, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 4;
		return this.#dataView.setInt32(byteOffset, value, littleEndian);
	}

	setUint8(value: number, byteOffset = this.#byteOffset) {
		this.#byteOffset = byteOffset + 1;
		return this.#dataView.setUint8(byteOffset, value);
	}

	setUint16(value: number, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 2;
		return this.#dataView.setUint16(byteOffset, value, littleEndian);
	}

	setUint32(value: number, byteOffset = this.#byteOffset, littleEndian = this.#littleEndian) {
		this.#byteOffset = byteOffset + 4;
		return this.#dataView.setUint32(byteOffset, value, littleEndian);
	}

	setBytes(bytes: ArrayLike<number>, byteOffset = this.#byteOffset) {
		let length = bytes.length;
		this.#byteOffset = byteOffset + length;
		new Uint8Array(this.#dataView.buffer, byteOffset + this.#dataView.byteOffset, length).set(bytes);
	}
}
