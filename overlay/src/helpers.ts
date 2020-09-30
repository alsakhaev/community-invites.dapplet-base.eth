export function groupBy<Y extends any>(xs: Y[], key: string): { [key: string]: Y[]} {
    return xs.reduce(function (rv: any, x: any) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};