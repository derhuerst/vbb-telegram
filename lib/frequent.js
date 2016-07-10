'use strict'

const frequent = (redis, user) => ({

	count: (key, data) =>
		redis.set('frequent:' + user + ':' + key, JSON.stringify(data))
		.then(
			() => redis.zincrby('frequent:' + user, 1, key),
			(e) => {throw e}
		),

	get: (n) =>
		redis.zrange('frequent:' + user, 0, n)
		.then((keys) => {
			keys = keys.map((k) => 'frequent:' + user + ':' + k)
			if (keys.length === 0) return Promise.resolve([])
			return redis.mget(keys)
			.then((vs) => vs.map((v) => ({text: JSON.parse(v)})))
		}, (e) => {throw e})

})

module.exports = frequent
