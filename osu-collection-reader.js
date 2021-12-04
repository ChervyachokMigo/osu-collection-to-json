var log = console.log.bind(console)
var fs = require('fs')
var path = require('path')

var bh = require('./osu-collection-bithexfunctions.js')
bh.debug = 0

var collectionReader = {

dataBuffer: Buffer.alloc(0),

data: [],

run: async function(){

	var collectionfile = 'C:\\Osu\\collection.db'
	var collectionsJson = 'collections.json'

	var stats = await fs.statSync(collectionfile)
	var fileSizeInBytes = stats.size
	this.dataBuffer = Buffer.alloc(fileSizeInBytes)

	bh.fd = await fs.promises.open(collectionfile,'r')

	this.data.version = await bh.getInt16()
	this.data.collectionsLength = await bh.getInt16()
	this.data.collections = []

	for (let cc = 1; cc <= this.data.collectionsLength; cc++){

		let collectionName = await bh.getString()
		let collectionCount = await bh.getInt16()
		let hashes = []

		for (let i = 1; i<= collectionCount; i++){
			let hash = await bh.getString()
			hashes.push(hash)
		}

		this.data.collections.push({[collectionName]: hashes, collectionLength: collectionCount })

	}

	bh.fd.close()

	log (this.data)
	var collectionsJsonData = await JSON.stringify({ ...this.data})
	var colJsonFile = await fs.promises.open(collectionsJson,'w')
	await colJsonFile.writeFile(collectionsJsonData)
	await colJsonFile.close()
}}


main = async function(){
	return (await collectionReader.run())
}
main()