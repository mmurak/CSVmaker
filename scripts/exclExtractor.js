// 除外リスト作成
class EXCLextractor {
    constructor(contents) {
        this.contents = contents;
    }
    analyse() {
        return new Set(this.contents.split(/\n/).map(x => x.trim()));
    }
}
