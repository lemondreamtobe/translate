
// 随机生成10位随机数
function randomNum() {
    var num = "";
    for (var i = 0; i < 10; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

const axios = require("axios");
const md5 = require('md5');
const appId = ""; // 你的开发者appid
const key = ""; // 你的开发者密钥
const api = "https://fanyi-api.baidu.com/api/trans/vip/translate";
const qs = require("qs");
const get = require("lodash/get");
const trim = require("lodash/trim");

async function translateText2En(txt) {
    const salt = randomNum();

    // 先生成sign
    const strLine = `${appId}${txt}${salt}${key}`;
    const sign = md5(strLine);

    // 设置utf-8
    axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    const res = await axios.post(api + "?" + qs.stringify({
        q: txt,
        from: "zh",
        to: "en",
        appid: appId,
        salt,
        sign
    }));

    return get(res.data.trans_result, "[0].dst");
}


function translateLocale() {

    // 读取locale下的cn.ts 内容
    const fs = require("fs");
    const path = require("path");
    const cnPath = path.join(__dirname, "/src/locale/cn.ts");

    fs.readFile(cnPath, "utf-8", (err, data) => {
        if (err) {
            console.log("读取cn.ts文件失败");
            return;
        }

        // 读取成功
        // console.log(data);

        // 正则匹配中文
        const reg = /"(.+)": "(.+)",?/g;
        const res = data.match(reg);

        data = data.replace(/cn/g, "en");

        Promise.all(res.map(async (item, index) => {
            return new Promise(async (resolve, rej) => {
                const [key, value] = item.split(":").map(v => trim(v).replace(/"/g, "").replace(/,/g, ""));

                const enValue = await translateText2En(value);
    
                // 将中文替换成英文
                data = data.replace(value, enValue);
                resolve(data);
            })
        })).then(() => {

            // 写入en.ts文件
            const enPath = path.join(__dirname, "/src/locale/en.ts");
            fs.writeFile(enPath, data, (err) => {
                if (err) {
                    console.log("写入en.ts文件失败");
                    return;
                }
                console.log("写入en.ts文件成功");
            });
        })
    });
}

translateLocale();
