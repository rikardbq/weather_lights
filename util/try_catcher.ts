type Ok<T> = T;
type Error<E> = E | unknown;
type Result<T, E> = {
    Ok: Ok<T> | null;
    Error: Error<E> | null;
};

export const tryCatch: <T, E>(arg: Promise<T>) => Promise<Result<T, E>> = async <T, E>(
    arg: Promise<T>,
) => {
    try {
        return {
            Ok: await arg,
            Error: null,
        };
    } catch (err: Error<E>) {
        return {
            Ok: null,
            Error: err,
        };
    }
};
