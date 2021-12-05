var log = console.log.bind(console)
var fs = require('fs')
var path = require('path')

var bh = require('./osu-collection-bithexfunctions.js')
bh.debug = 1

var collectionReader = {

data: [],
beatmaps: [],

readCollectionDb: async function(){

	var collectionfile = 'C:\\Osu\\collection.db'
	var collectionsJson = 'collections.json'

	await bh.openFileDB(collectionfile)	

	this.data.version = await bh.getInt()
	this.data.collectionsLength = await bh.getInt()
	this.data.collections = []

	for (let cc = 1; cc <= this.data.collectionsLength; cc++){

		let collectionName = await bh.getString()
		let collectionCount = await bh.getInt()
		let hashes = []

		for (let i = 1; i<= collectionCount; i++){
			let hash = await bh.getString()
			hashes.push(hash)
		}

		this.data.collections.push({[collectionName]: hashes, collectionLength: collectionCount })

	}

	await bh.closeFileDB()

	var collectionsJsonData = await JSON.stringify({ ...this.data})
	var colJsonFile = await fs.promises.open(collectionsJson,'w')
	await colJsonFile.writeFile(collectionsJsonData)
	await colJsonFile.close()
},

readOsuDb: async function(){

	var osuDbFile = 'C:\\Osu\\osu!.db'

	await bh.openFileDB(osuDbFile)

	this.beatmaps.version = await bh.getInt()

	this.beatmaps.FolderCount = await bh.getInt()

	this.beatmaps.isAcountUnlocked = await bh.getBool()

	this.beatmaps.DateWillUnlocked = await bh.getDate()

	this.beatmaps.PlayerName = await bh.getString()

	this.beatmaps.NumberBeatmaps = await bh.getInt()

	this.beatmaps.beatmaps = []

	for (let nb = 1; nb <= this.beatmaps.NumberBeatmaps; nb++){
		try{
		let beatmap = {}
		beatmap.artist = await bh.getString()

		beatmap.artistUni = await bh.getString()

		beatmap.title = await bh.getString()

		beatmap.titleUni = await bh.getString()

		beatmap.creator = await bh.getString()

		beatmap.difficulty = await bh.getString()

		beatmap.audioFile = await bh.getString()

		beatmap.hash = await bh.getString()

		beatmap.osuFilename = await bh.getString()

		beatmap.ranked = await bh.getByte()

		beatmap.hitcircles = await bh.getShort()

		beatmap.sliders = await bh.getShort()

		beatmap.spinners = await bh.getShort()

		beatmap.lastModify = await bh.getLong()

		beatmap.AR = await bh.getInt()//await bh.getSingle()

		beatmap.CS = await bh.getInt()//await bh.getSingle()

		beatmap.HP = await bh.getInt()//await bh.getSingle()

		beatmap.OD = await bh.getInt()//await bh.getSingle()

		beatmap.sliderVelocity = await bh.getDouble()

		beatmap.stars = await bh.getIntDoublePair()
		beatmap.stars2 = await bh.getIntDoublePair()
		beatmap.stars3 = await bh.getIntDoublePair()
		beatmap.stars4 = await bh.getIntDoublePair()

		beatmap.draintimeSec = await bh.getInt()

		beatmap.draintimeMs = await bh.getInt()

		beatmap.audioPreviewTime = await bh.getInt()

		beatmap.timingPointsNumber = await bh.getInt()

		beatmap.timingPoints = []

		for (let tp=1; tp<=beatmap.timingPointsNumber; tp++){
			beatmap.timingPoints.push(await bh.getTimingPoint())
		}

		beatmap.Id = await bh.getInt()
		beatmap.setId= await bh.getInt()
		beatmap.threadId = await bh.getInt()

		beatmap.gradeStd = await bh.getByte()
		beatmap.gradeTaiko = await bh.getByte()
		beatmap.gradeCTB = await bh.getByte()
		beatmap.gradeMania = await bh.getByte()

		beatmap.localOffset = await bh.getShort()
		beatmap.StackLaniency = await bh.getInt()

		beatmap.gamemode = await bh.getByte()

		beatmap.source = await bh.getString()
		beatmap.tags = await bh.getString()

		beatmap.onlineOffset = await bh.getShort()
		beatmap.fontTitle = await bh.getString()

		isBeatmapPlayed = await bh.getBool()
		beatmap.lastTimePlayed = await bh.getLong()
		isBeatmapOsz2 = await bh.getBool()

		beatmap.folderName = await bh.getString()
		beatmap.lastTimeChecked = await bh.getLong()

		isIgnoreSounds = await bh.getBool()
		isIgnoreSkin = await bh.getBool()
		isDisableStoryboard = await bh.getBool()
		isDisableVideo = await bh.getBool()
		isVisualOverride = await bh.getBool()

		beatmap.UnknownInt = await bh.getInt()
		beatmap.ManiaScrollSpeed = await bh.getByte()
		} catch (e){
	log (e)
}
	}


	await bh.closeFileDB()

}}


main = async function(){
	return (await collectionReader.readOsuDb())
}
main()