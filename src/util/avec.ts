type AVector = [number, number]|[number, number, number];

export function vadd(a:AVector, b:AVector):[number, number] {
    return [a[0] + b[0], a[1] + b[1]];
}
export function vleft(a:AVector):[number, number] {
    return [-a[1], a[0]];
}
export function vmuls(a:AVector, b:number):[number, number] {
    return [a[0]*b, a[1]*b];
}
export function vdivs(a:AVector, b:number):[number, number] {
    return [a[0]/b, a[1]/b];
}
export function vsub(a:AVector, b:AVector):[number, number] {
    return [a[0] - b[0], a[1] - b[1]];
}
export function vlen(a:AVector):number {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}