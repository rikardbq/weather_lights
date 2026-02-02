import { tryCatch } from "../util/try_catcher.ts";

export const sendTCP = async (msg: string, connOpts: Deno.ConnectOptions) => {
    const encoder = new TextEncoder();
    const tcpConn = await Deno.connect({ transport: "tcp", ...connOpts });

    await tcpConn.write(encoder.encode(msg));
    console.log("COMMAND=" + msg);

    const [response, error] = await tryCatch(
        tcpConn.write(encoder.encode(msg)),
    );
    if (response) {
        const buf = new Uint8Array(100);
        await tcpConn.read(buf);
        const decoder = new TextDecoder();
        const response = decoder.decode(buf);
        tcpConn.close();
        console.log("COMMAND_RESPONSE=" + response);

        return response;
    }

    tcpConn.close();
    console.error("ERROR=" + error);
};
