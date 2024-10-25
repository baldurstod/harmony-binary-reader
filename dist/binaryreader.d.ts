export declare const TWO_POW_10 = 1024;
export declare const TWO_POW_MINUS_14: number;
export declare function getCharCodes(str: string): Uint8Array;
type BinaryReaderBuffer = BinaryReader | Uint8Array | ArrayBuffer | string | number | ArrayLike<number>;
export declare class BinaryReader {
    #private;
    constructor(buffer: BinaryReaderBuffer, byteOffset?: number | undefined, byteLength?: number | undefined, littleEndian?: boolean);
    get buffer(): ArrayBuffer;
    get byteLength(): number;
    getDataView(): DataView;
    tell(): number;
    seek(byteOffset?: number): void;
    skip(byteLength?: number): void;
    getString(byteLength: number, byteOffset?: number): string;
    getNullString(byteOffset?: number): string;
    setString(str: string, byteOffset?: number): void;
    getBytes(byteLength: number, byteOffset?: number): Uint8Array;
    getInt8(byteOffset?: number): number;
    getUint8(byteOffset?: number): number;
    getInt16(byteOffset?: number, littleEndian?: boolean): number;
    getUint16(byteOffset?: number, littleEndian?: boolean): number;
    getFloat16(byteOffset?: number, littleEndian?: boolean): number;
    getInt32(byteOffset?: number, littleEndian?: boolean): number;
    getUint32(byteOffset?: number, littleEndian?: boolean): number;
    getFloat32(byteOffset?: number, littleEndian?: boolean): number;
    getBigInt64(byteOffset?: number, littleEndian?: boolean): bigint;
    getBigUint64(byteOffset?: number, littleEndian?: boolean): bigint;
    getFloat64(byteOffset?: number, littleEndian?: boolean): number;
    getVector2(byteOffset?: number, littleEndian?: boolean): Float32Array;
    getVector3(byteOffset?: number, littleEndian?: boolean): Float32Array;
    getVector4(byteOffset?: number, littleEndian?: boolean): Float32Array;
    getVector48(byteOffset?: number, littleEndian?: boolean): Float32Array;
    getQuaternion(byteOffset?: number, littleEndian?: boolean): Float32Array;
    setBigInt64(value: bigint, byteOffset?: number, littleEndian?: boolean): void;
    setBigUint64(value: bigint, byteOffset?: number, littleEndian?: boolean): void;
    setFloat32(value: number, byteOffset?: number, littleEndian?: boolean): void;
    setFloat64(value: number, byteOffset?: number, littleEndian?: boolean): void;
    setInt8(value: number, byteOffset?: number): void;
    setInt16(value: number, byteOffset?: number, littleEndian?: boolean): void;
    setInt32(value: number, byteOffset?: number, littleEndian?: boolean): void;
    setUint8(value: number, byteOffset?: number): void;
    setUint16(value: number, byteOffset?: number, littleEndian?: boolean): void;
    setUint32(value: number, byteOffset?: number, littleEndian?: boolean): void;
    setBytes(bytes: ArrayLike<number>, byteOffset?: number): void;
}
export {};
