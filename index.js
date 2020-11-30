const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res) => {
    return res.json({
        status: "working"
    });
});

app.post('/api/sendResponse', async (req, res) => {
    let speech = "";

    let item = req.body.queryResult &&
        req.body.queryResult.parameters &&
        req.body.queryResult.parameters.content
        ? req.body.queryResult.parameters.content
        : null;

    console.log(item);
    
    speech = await getContent(item);

    let speechResponse = {
        google: {
            expectUserResponse: true,
            richResponse: {
                items: [
                    {
                        simpleResponse: {
                            textToSpeech: speech
                        }
                    }
                ]
            }
        }
    };

    return res.json({
        payload: speechResponse,
        data: speechResponse,
        fulfillmentText: speech,
        speech: speech,
        displayText: speech,
        source: "webhook-vit"
    });
});

function getSubreddit(content) {
    if (content == "funny" || content == "joke" || content == "laugh")
        return { sub: "jokes", displayText: "joke" };
    else {
        return { sub: "todayILearned", displayText: "fact" };
    }
}

async function getContent(content) {
    let subReddit = getSubreddit(content);

    try {
        let response = await (await fetch(`http://www.reddit.com/r/${subReddit["sub"]}/top.json?sort=top&t=day`)).json();
        let thread = response["data"]["children"][(Math.floor((Math.random() * 24) + 1))]["data"];
        let output = `Here's a ${subReddit["displayText"]}: ${thread["title"]}`;
        if (subReddit['sub'] == "jokes") {
            output += " " + thread["selftext"];
        }
        output += "\nWhat do you want to hear next, a joke or a fact?"
        console.log(output);

        return output;
    } catch (error) {
        console.log(error);
        return null;
    }
}

app.listen(3030);
console.log("Service Running");