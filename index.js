const {getComments} = require("./facebook");
const fs = require("fs");
const {groupBy, flatten} = require("ramda");
var CESENATODAY_ID = "146865878725646";

const {keyFilename} = require("./constants");
//seguire i tutorial per installare l'SDK
//https://cloud.google.com/natural-language/
const language = require('@google-cloud/language');


function getResults() {

// Creates a client
    const client = new language.v1beta2.LanguageServiceClient({
        //
        keyFilename
    });
    return Promise.resolve(JSON.parse(fs.readFileSync("posts-mapped.json")))
        .then(posts => {
            var count = 0;
            let promises = Object.entries(posts)
                .filter(([key, messages]) => messages.length > 0)
                .map(([key, messages], i) => {

                    var promises = messages.map((text, j) => {
                        const document = {
                            content: text,
                            type: 'PLAIN_TEXT',
                        };
                        return new Promise((resolve, reject) => {
                            (function (index) {
                                setTimeout(_ => {
                                    console.log(index);
                                    client
                                        .analyzeSentiment({document: document})
                                        .then(respo => {

                                            resolve(respo)
                                        })
                                        .catch(_ => {
                                            resolve({})
                                        })
                                }, 500 * index);
                            })(count++);


                        })


                    });
                    return Promise.all(promises)
                        .then(messages => {
                            return {
                                key,
                                messages
                            }
                        })

                });
            return Promise.all(promises)
                .then(p => {
                    fs.writeFileSync("sent.json", JSON.stringify(p, null, 4))
                    return p
                })
        })
}

// getResults();

getComments(2000, CESENATODAY_ID).then(posts => {
    console.log(posts)
    return posts
}).then(posts => {
    fs.writeFileSync("posts.json", JSON.stringify(posts, null, 4))
    return groupBy(post => {
        return post.id;
    }, posts)
})
    .then(posts => {
        Object.entries(posts).forEach(([key, post]) => {
            let comments = post.map(({comments}) => comments);
            comments = flatten(comments)
            comments = comments.map(comment => comment.message);
            posts[key] = comments;

        })
        fs.writeFileSync("posts-mapped.json", JSON.stringify(posts, null, 4))
    })
    .then(getResults)




