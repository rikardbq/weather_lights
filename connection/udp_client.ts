import { tryCatch } from "../util/try_catcher.ts";

const LOCAL_HOSTNAME = Deno.env.get("LOCAL_HOSTNAME")!;
const LOCAL_PORT = parseInt(Deno.env.get("LOCAL_PORT")!);
const REMOTE_HOSTNAME = Deno.env.get("REMOTE_HOSTNAME")!;
const REMOTE_PORT = parseInt(Deno.env.get("REMOTE_PORT")!);

const datagramConn = Deno.listenDatagram({
    transport: "udp",
    hostname: LOCAL_HOSTNAME,
    port: LOCAL_PORT,
});

const remoteAddress: Deno.NetAddr = {
    transport: "udp",
    hostname: REMOTE_HOSTNAME,
    port: REMOTE_PORT,
};

export const sendUDP = async (msg: string) => {
    const encoder = new TextEncoder();
    await datagramConn.send(encoder.encode(msg), remoteAddress);

    const decoder = new TextDecoder();
    const [response, error] = await tryCatch(datagramConn.receive());
    if (response) {
        return decoder.decode(response[0]);
    }

    console.error("ERROR=" + error);
    datagramConn.close();
};
