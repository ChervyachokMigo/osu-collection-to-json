var log = console.log.bind(console)
var fs = require('fs')
var path = require('path')
var lodash = require('lodash')
var sanitize = require("sanitize-filename");

var bh = require('./osu-collection-bithexfunctions.js')
var progress = require('./progress-bar.js')
var config = require('./config.js')

bh.debug = 0
var collectionReader = {

data: [],
db: [],

readCollectionDbAndSaveJson: async function(){

	var collectionfile = config.osuFolder + '\\collection.db'
	var collectionsJson = 'collections.json'

	await bh.openFileDB(collectionfile)	

	this.data.version = await bh.getInt()
	this.data.collectionsLength = await bh.getInt()
	this.data.collections = []

	await progress.setDefault(this.data.collectionsLength,['Scanning collections','writing '+collectionsJson])

	for (let cc = 1; cc <= this.data.collectionsLength; cc++){

		let collectionName = await bh.getString()
		let collectionCount = await bh.getInt()
		let hashes = []
		progress.print()
		for (let i = 1; i<= collectionCount; i++){
			
			let hash = await bh.getString()
			hashes.push(hash)
		}

		this.data.collections.push({name: collectionName, hashes: hashes, collectionLength: collectionCount })

	}

	await bh.closeFileDB()

	var collectionsJsonData = await JSON.stringify({ ...this.data})
	var colJsonFile = await fs.promises.open(collectionsJson,'w')
	await colJsonFile.writeFile(collectionsJsonData)
	await colJsonFile.close()
},

readOsuDbAndSaveJson: async function(){

	var osuDbFile = config.osuFolder + '\\osu!.db'
	var beatmapsDBJsonFile = 'db.json'

	await bh.openFileDB(osuDbFile)

	this.db.version = await bh.getInt()

	this.db.FolderCount = await bh.getInt()

	this.db.isAcountUnlocked = await bh.getBool()

	this.db.DateWillUnlocked = await bh.getDate()

	this.db.PlayerName = await bh.getString()

	this.db.NumberBeatmaps = await bh.getInt()

	this.db.beatmaps = []

	await progress.setDefault(this.db.NumberBeatmaps,['Scanning beatmaps','writing '+beatmapsDBJsonFile])

	for (let nb = 1; nb <= this.db.NumberBeatmaps; nb++){
		try{
			await progress.print()
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
			beatmap.timingPoints.push( ...(await bh.getTimingPoint()))
		}

		beatmap.timingPoints = { ...beatmap.timingPoints}

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

		beatmap.isPlayed = await bh.getBool()
		beatmap.lastTimePlayed = await bh.getLong()
		beatmap.isOsz2 = await bh.getBool()

		beatmap.folderName = await bh.getString()
		beatmap.lastTimeChecked = await bh.getLong()

		beatmap.isIgnoreSounds = await bh.getBool()
		beatmap.isIgnoreSkin = await bh.getBool()
		beatmap.isDisableStoryboard = await bh.getBool()
		beatmap.isDisableVideo = await bh.getBool()
		beatmap.isVisualOverride = await bh.getBool()

		beatmap.UnknownInt = await bh.getInt()
		beatmap.ManiaScrollSpeed = await bh.getByte()

		this.db.beatmaps.push({ ...beatmap})
		} catch (e){
			log (e)
		}
	}

	await bh.closeFileDB()

	var beatmapsJsonData = await JSON.stringify({ ...this.db})
	var beatmapsJsonFile = await fs.promises.open(beatmapsDBJsonFile,'w')
	await beatmapsJsonFile.writeFile(beatmapsJsonData)
	await beatmapsJsonFile.close()

},
	
readJsonsAndMakePlaylists: async function(){
	let osuSongs = config.osuFolder + '\\Songs'
	let collectionsRAW = fs.readFileSync('collections.json');
	let collections = JSON.parse(collectionsRAW);
	let dbRAW = fs.readFileSync('db.json');
	let db = JSON.parse(dbRAW);
	if (this.debug==1) log("Collections: "+collections.collectionsLength)
	if (this.debug==1) log("DB stores: "+db.NumberBeatmaps)

	let collectionsAllHashesLength = 0
	for (let collection of collections.collections){
		collectionsAllHashesLength += collection.hashes.length
	}

	progress.setDefault(collectionsAllHashesLength,['reading collections','finding filepathes','store playlist'])

	var playlists = []

	for (let collection of collections.collections){
		let playlistItems = []
		for (let i = 0;i<collection.hashes.length;i++){
			progress.print()

			try {

				let beatmap = await lodash.filter(db.beatmaps, { 'hash': collection.hashes[i] } );
				beatmap = beatmap[0]
				if (beatmap.folderName && beatmap.audioFile ){
					let beatmapPath = osuSongs+'\\'+beatmap.folderName+'\\'+beatmap.audioFile
					playlistItems.push(beatmapPath)
				}

			} catch (e){}
		}

		playlistItems = await playlistItems.filter(onlyUnique);

		playlists.push({ name: collection.name, files: playlistItems})

	}
	
	for (let playlist of playlists){

		let playlistCurrent = ''

		for (let file of playlist.files){
			playlistCurrent += file + '\n'
			log(file)
		}

		await checkfolder('playlists')
		fs.writeFileSync('playlists\\'+sanitize(playlist.name)+'.m3u', playlistCurrent)
	}

}}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function checkfolder(path){
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, {
			recursive: true
		});
	}
}

main = async function(){
	if (config.rescanDB == 1){
		await collectionReader.readCollectionDbAndSaveJson()
		await collectionReader.readOsuDbAndSaveJson()
	}
	await collectionReader.readJsonsAndMakePlaylists()
}
main()