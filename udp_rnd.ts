import { sendTCP } from "./connection/tcp_client.ts";
import { sendUDP } from "./connection/udp_client.ts";
import { Lights } from "./models.ts";

// to run: deno run -A --unstable-net --env-file=test.env .\udp_rnd.ts

const MULTICAST_MESSAGE =
    'M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n';

const lights = new Lights();
setInterval(async () => {
    console.log("SEND > ");
    const res = await sendUDP(MULTICAST_MESSAGE);
    console.log(res);

    res?.split("\r\n").forEach((x) => {
        const [k, v] = x.split(": ");
        if (
            k === "id" ||
            k === "Location" ||
            k === "name" ||
            k === "support" ||
            k === "power" ||
            k === "color_mode"
        ) {
            lights.setState((state) => ({
                ...state,
                [k.toLowerCase()]: v,
            }));
        }
    });

    console.log("LIGHTS_STATE > ", lights.state);

    const command = {
        id: parseInt(lights.state.id, 16),
        method: "set_hsv",
        params: [255, 100, "smooth", 500],
    };

    const [_protocol, address, port] = lights.state.location.split(":");
    await sendTCP(JSON.stringify(command) + "\r\n", {
        hostname: address.replace("//", ""),
        port: parseInt(port),
    });
}, 5000);

/*
EXAMPLE RESPONSE:
-----------

HTTP/1.1 200 OK
Cache-Control: max-age=3600
Date:
Ext:
Location: yeelight://192.168.1.239:55443
Server: POSIX UPnP/1.0 YGLC/1
id: 0x000000000015243f
model: color
fw_ver: 18
support: get_prop set_default set_power toggle set_bright start_cf stop_cf set_scene
cron_add cron_get cron_del set_ct_abx set_rgb
power: on
bright: 100
color_mode: 2
ct: 4000
rgb: 16711680
hue: 100
sat: 35
name: my_bulb


EXAMPLE ADVERTISEMENT MESSAGE:
-----------

NOTIFY * HTTP/1.1
Host: 239.255.255.250:1982
Cache-Control: max-age=3600
Location: yeelight://192.168.1.239:55443
NTS: ssdp:alive
Server: POSIX, UPnP/1.0 YGLC/1
id: 0x000000000015243f
model: color
fw_ver: 18
support: get_prop set_default set_power toggle set_bright start_cf stop_cf set_scene
cron_add cron_get cron_del set_ct_abx set_rgb
power: on
bright: 100
color_mode: 2
ct: 4000
rgb: 16711680
hue: 100
sat: 35
name: my_bulb

*/
