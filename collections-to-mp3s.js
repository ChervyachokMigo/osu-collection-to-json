const { readFile, copyFileSync, readdirSync } = require('node:fs');
const path = require('node:path');

const { checkfolder } = require('./misc.js');
const config = require('./config.js');

const log = console.log.bind(console);

const get_Mp3Name_From_FullPath = (filepath) => {
	const filename_parts = filepath.split(path.sep).reverse();
	const filename = filename_parts.shift();
	const folder = filename_parts.shift();
	return `${folder} - ${filename}`
}

const readPlaylistAndCopyMp3 = ( playlistname )=>{

	if ( path.extname(playlistname) !=='.m3u' ) return false;

	const playlist_folder_fullpath = path.join( config.musicCollectionFolder, playlistname.replace( /\.m3u/g, "" ));

	checkfolder(playlist_folder_fullpath);

	readFile(  path.join( config.playlistsFolder, playlistname ), 'utf-8', (err, data) => {
		data = data.toString().replace(/[\\]+/g,"\\");
		data = data.split('\n');

		for (let filestring of data){
			if (filestring.length > 0){
				const mp3name = get_Mp3Name_From_FullPath(filestring);
				const filedest = path.join( playlist_folder_fullpath, mp3name );
				copyFileSync(filestring, filedest)
				log (`Copied:\n${filestring} => \n${filedest}\n`)
			}
		}
	})

}

const run = () => {
	try{
		const files = readdirSync(config.playlistsFolder);

		for (let playlist of files)
			readPlaylistAndCopyMp3( playlist.toString() );
		
	} catch (e){
		throw new Error (`Unknown playlist folder. Check config file.`)
	}
}

run();