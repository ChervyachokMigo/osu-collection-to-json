var log = console.log.bind(console)
var fs = require('fs')
var path = require('path')

var m3u_filecopier = {

run: async function(){
	var playlist = '!!!!!!!!!!!!!!!!!!!!!alt4.m3u'
	var playlistfolder = playlist.toString().replace(/\.m3u/g,"")
	var m3ufile = 'playlists\\'+playlist
	var namefile = 1
	await fs.readFile(m3ufile,'utf-8',function(e,data){
		data = data.toString().replace(/[\\]+/g,"\\")
		if (!fs.existsSync(playlistfolder)){
	    fs.mkdirSync(playlistfolder, { recursive: true });
		}
		data = data.split('\n')
		for (var filestring of data){
			if (filestring.length > 0){
				var filedest = playlistfolder+'\\'+namefile+'.mp3'
				fs.copyFile(filestring, filedest ,(err) => {
		  		if (err) 
		  			throw err
		  		log ('copied '+filestring+' to '+filedest)
				})
				
				namefile = namefile + 1
			}
		}
	})

}}

main = async function(){
		return (await m3u_filecopier.run())
}
main()