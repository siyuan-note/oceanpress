// apis/time.ts
export function currentTime() {
    return Date.now();
}

/**
 *  服务端的方法
 */
export function currentTime2(toLocaleString: boolean) {
    if (toLocaleString) {
        return new Date().toLocaleString();
    } else {
        return Date.now();
    }
}