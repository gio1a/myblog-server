const redis = require("redis");

const { REDIS_CONF } = require("../conf/db");

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);

!async function () {
    await redisClient.connect()
        .then(() => {
            console.log("redis connect success!");
        })
        .catch(console.error);
}();

async function set(key, val) {
    let objVal;
    if (typeof val === "object") {
        objVal = JSON.stringify(val);
    } else {
        objVal = val;
    }
    await redisClient.set(key, objVal);
}

async function get(key) {
    try {
        let val = await redisClient.get(key);
        if (val == null) return val;
        try {
            val = JSON.parse(val);
        } catch (err) {}
        return val;
    } catch (error) {
        throw error;
    }
}

module.exports = { set, get };
