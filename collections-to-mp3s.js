var log = console.log.bind(console)
var config = require('./config.js')
var fs = require('fs')
var path = require('path')

var run = async ()=>{
	try{
		var playlistsDir = fs.readdirSync(config.playlistsFolder)
	} catch (e){
		throw new Error (`Unknown playlist folder. Check config file.`)
	}

	if (config.musicCollectionFolder)
		config.musicCollectionFolder += '\\'

	for (playlistFile of playlistsDir)
		await readPlaylistAndCopyMp3( playlistFile.toString() )
	
	return true
}

var readPlaylistAndCopyMp3 = async ( playlistname )=>{

	if ( path.extname(playlistname) !=='.m3u' ) return false

	var playlist_folder_fullpath = `${config.musicCollectionFolder}${playlistname.replace(/\.m3u/g,"")}`

	if (!fs.existsSync(playlist_folder_fullpath))
	fs.mkdirSync(playlist_folder_fullpath, { recursive: true });		

	fs.readFile(`${config.playlistsFolder}\\${playlistname}`,'utf-8',function( e, data){
		data = data.toString().replace(/[\\]+/g,"\\")	

		data = data.split('\n')

		for (var filestring of data){
			if (filestring.length > 0){
				var mp3name = get_Mp3Name_From_FullPath(filestring)
				var filedest = `${playlist_folder_fullpath}\\${mp3name}`
				fs.copyFileSync(filestring, filedest)
				log (`Copied:\n${filestring} => \n${filedest}\n`)
			}
		}
	})

}

function get_Mp3Name_From_FullPath(path){
	var filename_parts = path.split('\\').reverse()
	var filename = filename_parts.shift()
	var filefoldername = filename_parts.shift()
	return `${filefoldername} - ${filename}`
}

main = async function(){
	return ( await run() )
}
main()