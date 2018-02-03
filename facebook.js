/**
 * Created by marcogobbi on 30/07/2017.
 */
var FB = require('fb');
FB.options({version: 'v2.10'});
const {client_id, client_secret} = require("./constants");

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        FB.api('oauth/access_token', {
            client_id,
            client_secret,
            grant_type: 'client_credentials'
        }, function (res) {

            if (!res || res.error) {
                reject(res.error);
                /* console.log(!res ? 'error occurred' : res.error);
                 return;*/
            } else {
                var access_token = res.access_token;
                var expires = res.expires ? res.expires : 0;
                FB.setAccessToken(access_token);
                resolve({
                    access_token: access_token,
                    expires: expires
                })
            }


        });
    })
}


function _getPosts(id, limit = 30) {

    return new Promise(function (resolve, reject) {
        FB.api(id, {
            fields: [`posts.limit(${limit}){message,full_picture,created_time}`]
        }, function (res) {
            //  res.category_list = place.category_list;
            if (!res || res.error) {
                console.log("no", res, id);
                resolve([]);

                return;
            }

            console.log("si posts");
            resolve(res.posts.data);
        })
    });
}


function getPosts(limit, page_id) {
    return getAccessToken()
        .then(_ => {
            return _getPosts(page_id, limit)
        })
        .catch(e => [])
}

function getComments(limit, page_id) {
    return getPosts(limit, page_id)
        .then(posts => {
            return Promise.all(
                posts.map((post, i) => {
                    return new Promise(resolve => {
                        setTimeout(_ => {
                            FB.api(post.id, {
                                fields: [`comments`]
                            }, function (res) {
                                //  res.category_list = place.category_list;
                                if (!res || res.error) {
                                    console.log("no comments", res, post.id);
                                    resolve({
                                        id: post.id
                                        , message: post.message
                                        , comments: []
                                    });

                                    return;
                                }

                                console.log("si getComments");
                                if (res.comments) {
                                    resolve({
                                        id: post.id
                                        , message: post.message
                                        , comments: res.comments.data
                                    });
                                } else {
                                    resolve({
                                        id: post.id
                                        , message: post.message
                                        , comments: []
                                    })
                                }

                            })
                        }, 500 * i)

                    })
                })
            )
        })
}



module.exports = {
      getComments
}

//