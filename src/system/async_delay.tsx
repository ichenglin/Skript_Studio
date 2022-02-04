export async function async_delay(milliseconds: number) {
    await new Promise(resolve => setTimeout(() => {
        resolve(true);
    }, milliseconds));
}