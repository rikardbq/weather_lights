// deno-lint-ignore-file no-explicit-any
type StateObj = { [k: string]: any };

export class Lights {
    state;

    constructor(state: StateObj = {}) {
        this.state = state;
    }

    setState = (arg: StateObj | ((cb: StateObj) => void)) => {
        if (typeof arg === "function") {
            this.state = arg(this.state);
        } else {
            this.state = arg;
        }
    };

    resetState = () => {
        this.state = {};
    };
}
