const {beatmap_property, osu_db_load, collection_db_load} = require('osu-tools');
const path = require('path');
const {writeFileSync} = require('fs');
const {copySync} = require('fs-extra');
const lodash = require('lodash');
const sanitize = require('sanitize-filename');

const progress = require('./progress-bar.js');
const config = require('./config.js');
const { checkfolder, onlyUnique } = require('./misc.js');

const log = console.log.bind(console);

const debug = config.isDebug;

const get_collections = () => {
	const collections = collection_db_load(path.join(config.osuFolder,'collection.db'));
	const props = [beatmap_property.audio_filename, beatmap_property.folder_name, beatmap_property.beatmap_md5];
	const osu_db = osu_db_load(path.join(config.osuFolder, 'osu!.db'), props);
	return {collections, osu_db};
}

const MakePlaylists = () => {
	const {collections, osu_db} = get_collections();

	const osuSongs = path.join(config.osuFolder, 'Songs');

	if (debug) log("Collections: "+collections.collections.length);
	if (debug) log("DB stores: "+osu_db.number_beatmaps);

	let collectionsAllHashesLength = 0;
	for (let collection of collections.collections){
		collectionsAllHashesLength += collection.beatmaps_md5.length;
	}

	progress.setDefault(collectionsAllHashesLength,['reading collections','finding filepathes']);

	const playlists = [];

	for (let collection of collections.collections){
		let playlistItems = [];
		let playlitsFolders = [];

		for ( let i = 0; i < collection.beatmaps_md5.length; i++ ){
			progress.print();
			const beatmap = lodash.filter(osu_db.beatmaps, { 'beatmap_md5': collection.beatmaps_md5[i] } ).shift();
			if (beatmap && beatmap.folder_name && beatmap.audio_filename ){
				playlistItems.push( path.join( osuSongs, beatmap.folder_name, beatmap.audio_filename ));
				playlitsFolders.push( path.join( osuSongs, beatmap.folder_name ));
			}
		}

		playlists.push({ name: collection.name, files: playlistItems.filter(onlyUnique), pathes: playlitsFolders.filter(onlyUnique)});
	}
	
	let storetasks = [];
	if (config.storePlaylists){
		storetasks.push('store playlists');
	}
	if (config.backupCollectionSongsFolder){
		storetasks.push('backup songs');
	}

	progress.setDefault(playlists.length,storetasks)

	const backup_path = path.join( config.backupCollectionDestination, 'songsbackup' ); 
	if (config.backupCollectionSongsFolder) checkfolder( backup_path );

	for (let playlist of playlists){
		progress.print();

		if (config.storePlaylists){
			let playlistCurrent = '';

			for (let file of playlist.files){
				playlistCurrent += file + '\n';
				if (debug) log(file);
			}

			checkfolder(config.playlistsFolder);
			writeFileSync(`${config.playlistsFolder}\\${sanitize(playlist.name)}.m3u`, playlistCurrent);
		}

		if (config.backupCollectionSongsFolder){
			for (let beatmappath of playlist.pathes){
				copySync( beatmappath, path.join( backup_path, path.basename( beatmappath )), { overwrite: config.overwriteBackupFolders });
			}
		}
	}
}



MakePlaylists();
