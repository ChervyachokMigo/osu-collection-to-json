const { existsSync, mkdirSync } = require('node:fs');

module.exports = {
	onlyUnique: (value, index, self) => {
		return self.indexOf(value) === index;
	},

	checkfolder: (path) => {
		if (!existsSync(path)) {
			mkdirSync(path, {
				recursive: true
			});
		}
	},

}