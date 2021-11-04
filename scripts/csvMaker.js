// Global section
const srtfile = document.getElementById("srtfile");
const exclfile = document.getElementById("exclfile");
const displayfield = document.getElementById("displayfield");
const dicsearch = document.getElementById("dicsearch");
const otherside = document.getElementById("otherside");
const listarea = document.getElementById("listarea");

const selectedColor = "rgb(224, 255, 255)"
const registeredColor = "rgb(255, 192, 203)"

let ExclList = new Set();   // 除外リスト
let WordList = [];          // 単語リスト（除外リストの内容は適宜削除される）
let TargetList = {}         // 裏面設定単語のリスト

let latestEntry;

// 除外リストと単語リストのすり合わせ＆表示
function processAndDisplay() {
    console.log("Excl. count: " + ExclList.size);
    console.log("Word count (before processing): " + WordList.length);
    WordList = WordList.filter(x => !(ExclList.has(x)));
    console.log("Word count (after processing): " + WordList.length);
    while (listarea.firstChild) {
        listarea.removeChild(listarea.lastChild);
    }
    for(let w of WordList.sort()) {
        let tf = document.createElement("input");
        tf.type="textfield";
        tf.value = w;
        tf.spellcheck = false;
        tf.autocomplete = "off";
        listarea.appendChild(tf);
    }
}

// SRTファイル入力イベント
let reader = new FileReader();
srtfile.addEventListener('change', evt => {
    for (let file of srtfile.files){
        reader.readAsText(file, 'UTF-8');
        reader.onload = ()=> {
let srtX = new SRTextractor(reader.result);
WordList = srtX.analyse();
processAndDisplay();
        };
    }
});

// 除外ファイル入力イベント
let ereader = new FileReader();
exclfile.addEventListener('change', evt => {
    for (let file of exclfile.files){
        ereader.readAsText(file, 'UTF-8');
        ereader.onload = ()=> {
let exclX = new EXCLextractor(ereader.result);
ExclList = exclX.analyse();
processAndDisplay();
        };
    }
});

// 一覧領域クリック時の処理
listarea.addEventListener("click", evt => {
    if (document.activeElement.nodeName != "INPUT") {
        return;
    }
    clearColors();
    latestEntry = document.activeElement;
    if (latestEntry.style.backgroundColor != registeredColor) {      // first edit
        setColor(latestEntry);
        otherside.value = "";
    } else {    // in case of re-edit
        otherside.value = TargetList[latestEntry.value];
    }
    let str = document.getSelection();
    if (str == "") {        // Workaround for Firefox
        str = latestEntry.value.substring(latestEntry.selectionStart, latestEntry.selectionEnd);
    }
    if (str == "") {
        str = latestEntry.value;
    }
    displayfield.value = str;
});

dicsearch.addEventListener("click", evt => dicSearch(evt));

// 選択色解除（登録色を除く）
function clearColors() {
    listarea.childNodes.forEach(elem => {
        if (elem.style.backgroundColor != registeredColor) {
elem.style = "";
        }
    });
}

// 選択色を設定
function setColor(elem) {
    elem.style = "background-color:" + selectedColor;
}

// 辞書検索時の処理
function dicSearch(evt) {
    if (evt.shiftKey) {
        let val = prompt("Enter dictionary URL (now: " + DictionaryURL + ")");
        if (val != null) {
            DictionaryURL = val;
            return;
        }
    }
    window.open("https://" + DictionaryURL + "/" + displayfield.value, 'dict', "width=" + Width + ",height=" + Height);
}

// 登録処理
function register() {
    if (displayfield.value in TargetList) {
        if (!confirm("Already defined: " + displayfield.value + "\n Overwrite?")) {
return;
        }
    }
    TargetList[displayfield.value] = otherside.value;
    latestEntry.value = displayfield.value;     // in case of the future re-edit
    latestEntry.style = "background-color:" + registeredColor;
}

// ファイル出力
function outputFiles() {
    let csv = "";
    for (let [k, v] of Object.entries(TargetList)) {
        k = k.replaceAll('"', '""');
        v = v.replaceAll('"', '""');
        csv += '"' + k + '","' + v + '"\n';
    }
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let blob = new Blob([bom, csv], { "type" : "text/plain" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "output.csv";
    link.click();
    console.log("Output CSV: " + Object.keys(TargetList).length);

    let excldata = "";
    for (i of Array.from(ExclList)) {
        excldata += i + "\n";
    }
    listarea.childNodes.forEach(elem => {
        excldata += elem.value + "\n";
    });
    let bom2 = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let blob2 = new Blob([bom2, excldata ], { "type" : "text/plain" });
    let link2 = document.createElement("a");
    link2.href = URL.createObjectURL(blob2);
    link2.download =  "output.excl";
    link2.click();
    console.log("Output Excl: " + (ExclList.size + WordList.length));
}

// 起動時のパラメーター設定
const pm = new ParmManager();
let DictionaryURL = pm.getParm("dic", "www.collinsdictionary.com/dictionary/english");
let Width = pm.getParm("w", 600);
let Height = pm.getParm("h", 800);
