class ParmManager {
    constructor() {
        this.parmList = [];
        let arg = location.search.substring(1);
        if (arg != "") {
            let args = arg.split("&");
            for (let i = 0; i < args.length; i++) {
                let parmPair = args[i].split("=");
                this.parmList[parmPair[0]] = parmPair[1];
            }
        }
    }
    getParm(key, defaultValue) {
        if (key in this.parmList) {
            return this.parmList[key];
        } else {
            return defaultValue;
        }
    }
}
