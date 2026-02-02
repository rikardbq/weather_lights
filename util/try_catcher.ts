type Result<T, E = unknown> = [T, null] | [null, E];

export const tryCatch = async <T, E = unknown>(
    arg: Promise<T>,
): Promise<Result<T, E>> => {
    try {
        const res = await arg;
        return [res, null];
    } catch (err) {
        return [null, err as E];
    }
};
