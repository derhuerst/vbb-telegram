'use strict'

const Redis = require('ioredis')

const redis = new Redis()
const err = (e) => {throw e}



const keys = (p) =>
	redis.keys(p)

const del = (ks) =>
	redis.del(ks)



const get = (k) =>
	redis.get(k)
	.then((v) => JSON.parse(v), err)

const mget = (ks) =>
	redis.mget(ks)
	.then((vs) => vs.map((v) => JSON.parse(v)), err)



const set = (k, v) =>
	redis.set(k, JSON.stringify(v))

const setnx = (k, v) =>
	redis.setnx(k, JSON.stringify(v))



const highest = (s, n) =>
	redis.zrevrange(s, 0, n)

const inc = (s, k) =>
	redis.zincrby(s, 1, k)



module.exports = {keys, del, get, mget, set, highest, inc}
