// 単語リスト作成
class SRTextractor {
    constructor(contents) {
        this.contents = contents;
        this.lineNo = new RegExp("^[0-9]+$");
        this.timing = new RegExp("^[0-9\:,]+ --> [0-9\:,]+$");
        this.tag1 = new RegExp("<[^>]+>", "g");
        this.tag2 = new RegExp("<{^}]+}", "g");
        this.parens = new RegExp("(^[(]|[)]$)", "g");
        this.terminalSymbols = new RegExp("[.,!?'\"\x2d]+$");
        this.startSymbols = new RegExp("^(\"|\-|\\x2e)+");
        this.nonWord = new RegExp("^[^a-zA-Z]+$");
    }
    _scriptLineP(line) {
        if (line == "" || this.lineNo.test(line) || this.timing.test(line)) {
            return false;
        } else {
            return true;
        }
    }
    analyse() {
        let lines = this.contents.split(/\n/);
        let wordSet = new Set();
        for (let rec of lines) {
            rec = rec.trim();
            if (this._scriptLineP(rec)) {   // Script, indeed
                let words = rec.split(/\s+/)    // Make them explode at spaces
                for (let w of words) {
                    w = w.replaceAll(this.tag1, "");
                    w = w.replaceAll(this.tag2, "");
                    w = w.replaceAll(this.parens, "");
                    w = w.replace(this.terminalSymbols, "");
                    w = w.replace(this.startSymbols, "");
                    w = w.replace(this.nonWord, "");
                    if (w != "") {
                        wordSet.add(w.toLowerCase());
                    }
                }
            }
        }
        return Array.from(wordSet);
    }
}
