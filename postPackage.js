import fs from 'fs';
import path from 'path';
import { zip } from 'compressing';
import axios from 'axios';
import data from './env.js';
import { question } from 'readline-sync';

(async () => {

    for (const i in data) {
        if (!data[i]) {
            console.log(`缺少${i},请检查env文件`)
            return;
        }
    }

    const { id, version, password, api } = data;
    
    const DIR = "./client";
    const DEST = "./frontend.zip";

    const entries = fs.readdirSync(DIR);
    const stream = new zip.Stream();
    for (let entry of entries) {
        console.log(path.join(DIR, entry));
        stream.addEntry(path.join(DIR, entry));
    }
    await new Promise((res) => {
        stream
            .pipe(fs.createWriteStream(DEST))
            .once('finish', res);
    });
    console.log("compress over, start request");
    const answer = question("Press 'y' to continue.\n");
    if (answer != 'y') {
        console.log("更新已取消");
        return;
    }

    try {
        const res = await axios.postForm(api, {
            id: id,
            version,
            token: password,
            file: fs.createReadStream(DEST),
        });
        console.log(res.data)
    } catch(e) {
        console.log("error:", e)
    }

    fs.unlinkSync(DEST);
})();