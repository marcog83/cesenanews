/**
 * Created by marcogobbi on 30/07/2017.
 */
//527574454103325?fields=albums{id}
var FB = require('fb');
FB.options({version: 'v2.10'});

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        FB.api('oauth/access_token', {
            client_id: '214654845382404',
            client_secret: '55d81ea2021bd08d24ab9b6e619638dd',
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

function getPlaceDetails(id) {

    return new Promise(function (resolve, reject) {
        FB.api(id, {
            fields: ["albums{id}"
            ]
        }, function (res) {
            //  res.category_list = place.category_list;
            if (!res || res.error) {
                console.log("no", res, id);
                resolve({});

                return;
            }

            console.log("si", res.name);
            resolve(res.albums.data);
        })
    });
}

function getAlbumImages(id) {

    return new Promise(function (resolve, reject) {
        FB.api(id, {
            fields: ["photos{images,created_time}"]
        }, function (res) {
            //  res.category_list = place.category_list;
            if (!res || res.error) {
                console.log("no", res, id);
                resolve({});

                return;
            }

            console.log("si", res.name);
            resolve(res.photos.data.map(({images, created_time}) => {
                return {
                    image: images[0]
                    , created_time
                }
            }));
        })
    });
}

function _getInfo(id) {
    return new Promise(function (resolve, reject) {
        FB.api(id, {
            fields: [`cover,description`]
        }, function (res) {

            if (!res || res.error) {
                console.log("no", res, id);
                resolve({cover: {source: "/static/img/bg.jpg"}, description: ""});

                return;
            }

            console.log("si posts");
            resolve(res);
        })
    });
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

const STONEBRIDGE_ID = "527574454103325";

function getPhotos() {
    return getAccessToken()
        .then(function () {
            return getPlaceDetails(STONEBRIDGE_ID)
        })
        .then(response => {
            return Promise.all(response.map(({id}) => {
                return getAlbumImages(id)
            }))
        }).catch(e => [])
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
                posts.map((post,i) => {
                    return new Promise(resolve => {
                       setTimeout(_=>{
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
                                       id:post.id
                                       ,message:post.message
                                       ,comments:[]
                                   })
                               }

                           })
                       },500*i)

                    })
                })
            )
        })
}

function getInfo() {
    return getAccessToken()
        .then(_ => {
            return _getInfo(STONEBRIDGE_ID)
        }).catch(e => {
        })
}

module.exports = {
    getPosts
    , getPhotos
    , getInfo
    , getComments
}

//