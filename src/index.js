import HololiveCosplayList from "./List.js";
import express from 'express';

const app = express();
const port = (process.env.PORT || 3000);

const holoList = new HololiveCosplayList();

await holoList.init();

app.get('/', (req, res) => {
        res.redirect('/random');
});

app.get('/random', async (req, res) => {
        let talent = await holoList.randomTalentToCosplay();
        let talentPicture = await holoList.getTalentPicture(talent);

        let isAllCosplayed = await holoList.isAllCosplayed();

        if (!isAllCosplayed) {
                res.send(`
            <html>
                <head>
                    <title>Hololive Cosplay</title>
                    <style>
                        body {
                            margin: 0;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            font-family: sans-serif;
                            background-color: #fdf6e3;
                            text-align: center;
                        }
        
                        h1 {
                            font-size: 2em;
                            margin-bottom: 20px;
                        }
        
                        img {
                            max-width: 300px;
                            border-radius: 10px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        }
                    </style>
                </head>
                <body>
                    <h1>Now, you should cosplay as ${talent}!</h1>
                    <h2>(Refresh if you've already cosplayed her, or if you don't want to)</h2>
                    <img src="${talentPicture}" alt="${talent}" />
                </body>
            </html>
        `);
        } else {
                res.send(`
                <html>
                <head>
                    <title>Hololive Cosplay</title>
                    <style>
                        body {
                            margin: 0;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            font-family: sans-serif;
                            background-color: #fdf6e3;
                            text-align: center;
                        }
        
                        h1 {
                            font-size: 2em;
                            margin-bottom: 20px;
                        }
        
                        img {
                            max-width: 300px;
                            border-radius: 10px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        }
                    </style>
                </head>
                <body>
                    <h1>All talent has been cosplayed!</h1>
                    <h2>Thanks for your hard work</h2>
                </body>
            </html>
        `);
        }
})

app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        console.log(`You can get a random Hololive talent to cosplay by visiting http://localhost:${port}/random`);
        console.log("Test 3")
})
