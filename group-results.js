const fs = require("fs");
const {groupBy, flatten,find} = require("ramda");

const sent = require("./sent.json");


function findScore(messages) {
    const step1 = flatten(messages);
    return step1.reduce((prev, {documentSentiment}) => {
        if (!documentSentiment) return prev;
        let score = 0;
        if (documentSentiment.score >= 0.05) {
            score = 1;
        } else if (documentSentiment.score <= -0.05) {
            score = -1;
        }
        return prev + score;
    }, 0);
}

const messages = sent
//.filter((_, i) => i < 3)
    .map(({key, messages}) => {
        return {
            key,
            score: findScore(messages)
        }

    }).map(({key, score}) => {
        let newScore = "neutrale";
        if (score > 0) {
            newScore = "positivo"
        } else if (score < 0) {
            newScore = "negativo";
        }
        return {
            key,
            score: newScore
        }
    })

var posts = require("./posts.json");
var postsMapped = require("./posts-mapped.json");
var groups = Object.entries(groupBy(post => {
    return post.score;
}, messages)).reduce((prev, [key, values]) => {
    prev[key] = {
        posts: values.map(({key}) => {
            const post=find(({id})=>id===key,posts);

            return {
                key,
                message:post.message
            }
        })
        , length: values.length
    };
    return prev;
}, {});



const postsConMessaggi=Object.entries(postsMapped)
    .filter(([key, messages]) => messages.length > 0);

const postsSenzaMessaggi=Object.entries(postsMapped)
    .filter(([key, messages]) => messages.length === 0);
const lengthMessages=Object.entries(postsMapped)
    .reduce((prev,[key, messages]) => prev+messages.length,0)

console.log("post totali",posts.length);
console.log("post con sentimental analysis",sent.length);
console.log("post con messaggi",postsConMessaggi.length);
console.log("post senza messaggi",postsSenzaMessaggi.length);
console.log("totale commenti",lengthMessages);

fs.writeFileSync("./scores.json", JSON.stringify(groups, null, 4));
