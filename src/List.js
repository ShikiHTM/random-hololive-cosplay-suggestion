import axios from 'axios';
import fs from 'node:fs/promises';
import devMode from './devMode.js';

export default class HololiveCosplayList {
    #list = new Map();
    #talentPicture = new Map();

    async init() {
        try {
            await fs.access('hololive_cosplay_list.json');
            await fs.access('hololive_picture.json')
            const data = await fs.readFile('./hololive_cosplay_list.json', 'utf8');
            const pictureData = await fs.readFile('./hololive_picture.json', 'utf8');
            this.#talentPicture = new Map(Object.entries(JSON.parse(pictureData)));
            this.#list = new Map(Object.entries(JSON.parse(data)));
            console.log('hololive_cosplay_list.json read successfully!');
        } catch (err) {
            if (err.code === 'ENOENT') {
                const list = await this.#generateList();
                await fs.writeFile('hololive_cosplay_list.json', JSON.stringify(list, null, 2));
                await fs.writeFile('hololive_picture.json', JSON.stringify(Object.fromEntries(this.#talentPicture), null, 2));
                console.log('hololive_picture.json created successfully!');
                console.log('hololive_cosplay_list.json created successfully!');
            } else {
                console.error(err);
            }
        }
    }

    async #generateList() {
        let list = new Map();

        for(let i = 0; i < 3; ++i) {
            let apiResp = await axios({
                method: 'get',
                url: process.env.API_URL + "/channels" + `?type=vtuber&offset=${i * 50}&limit=50&org=Hololive`,
                headers: {
                    'X-APIKEY': process.env.API_KEY_X,
                }
            })
    
            if(apiResp.status !== 200) {
                console.error(`Error: ${apiResp.status} - ${apiResp.statusText}`)
            }
    
            let filteredData = await JSON.parse(JSON.stringify(apiResp.data))
    
            filteredData.filter((el) => el.group.indexOf("HOLOSTARS") == -1 && (el.group.indexOf("English") > -1 || el.group.indexOf("Generation") > -1 || el.group.indexOf("DEV_IS") > -1 || el.group.indexOf("Indonesia") > -1) && el.group.indexOf("misc") == -1 && el.group.indexOf("CN") == -1).forEach((el) => {
                list.set(el.english_name, false);
                this.#talentPicture.set(el.english_name, el.photo);
            });
        }
        return Object.fromEntries(list);
    }

    async updateFile() {
        // The list is update in randomTalentToCosplay() now rewrite the file

        await fs.writeFile('hololive_cosplay_list.json', JSON.stringify(Object.fromEntries(this.#list), null, 2));
        console.log('hololive_cosplay_list.json updated successfully!');
    }

    async getTalentPicture(talent) {
        if(!this.#talentPicture.has(talent)) {
            console.log(`Talent ${talent} not found in the list.`);
            return -1;
        }
        return this.#talentPicture.get(talent);
    }

    async isCosplayed(talent) {
        if(!this.#list.has(talent)) {
            console.error(`Talent ${talent} not found in the list.`);
            return -1;
        }
        return this.#list.get(talent);
    }

    async setCosplayed(talent) {
        if(!this.#list.has(talent)) {
            console.error(`Talent ${talent} not found in the list.`);
            return -1;
        }
        this.#list.set(talent, true);
        if(!devMode.dev) await this.updateFile();
    }

    async isAllCosplayed() {
        let isAllCosplayed = Array.from(this.#list.values()).every(cosplayed => cosplayed === true)

        return isAllCosplayed;
    }

    async randomTalentToCosplay() {
        let talentAvailable = Array.from(this.#list.keys()).filter(talent => !this.#list.get(talent));

        if(talentAvailable.length == 0) {
            console.log("All talents have been cosplayed!");
            return 1;
        }

        let randomIndex = Math.floor(Math.random() * talentAvailable.length);
        let randomTalent = talentAvailable[randomIndex];

        this.setCosplayed(randomTalent);

        return randomTalent;
    }
}