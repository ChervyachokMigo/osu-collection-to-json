module.exports = {

	osuFolder: 'C:\\Osu',			//your osu folder with back slashes
	rescanDB: 0	,					//1 - rescan osu .db files, 0 - switch off
									//switch to 1 - first
	
	isFullRescan: 0,				//store every parameter of beatmap to json
	isDebug: 0,						//show getting variables for debugging

	//store all collections to playlists
	storePlaylists: 1,				

	//destination of playlists
	playlistsFolder: 'playlists',	

	//destination of copy music
	musicCollectionFolder: 'F:\\osu_collections_music',	

	//backup all songs-folders from collection
	backupCollectionSongsFolder: 0,
	backupCollectionDestination: `F:\\osu_songs_backup`,
	overwriteBackupFolders: false,
}
