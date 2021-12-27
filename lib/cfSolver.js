const axios = require("axios");
const request = require("request");

const endpoint = 'http://flaresolver1.herokuapp.com/v1';

const getCfCookie = async (url) => {
    try {
        const payload = {
            cmd: "request.get",
            url: url,
            maxTimeout: 10000,
        };

        const response = await axios.post(endpoint, payload, {
            headers: {
                "Content-Type": "application/json"
            },
        });

        return response.data.solution.cookies[0];
    }
    catch (error) {
        console.error(error.response.data);
    }

};

const getCfCookieJar = async (url) => {
    return request.jar().setCookie(await getCfCookie(url).toString(), url);
}

module.exports = {
    getCfCookieJar,
};