var log = console.log.bind(console)
var fs = require('fs')
module.exports = {
	_cursoroffset: 0,
	debug: 0,
	fd: 0,
	dataBuffer: Buffer.alloc(0),

	openFileDB: async function(fileDb){
		var stats = await fs.statSync(fileDb)
		var fileSizeInBytes = stats.size
		this.dataBuffer = Buffer.alloc(fileSizeInBytes)
		this.fd = await fs.promises.open(fileDb,'r')
		this._cursoroffset = 0
		//throw new Error(this.dataBuffer.length)
	},

	closeFileDB: async function(fileDb){
		await this.fd.close()
	},

	getByte: async function (){
		return this.getInt8()
	},

	getBool: async function (){
		return this.getInt8()
	},

	getShort: async function (){
		return this.getInt16()
	},

	getInt: async function (){
		return this.getInt32()
	},

	getDate: async function (){
		return this.getInt64()
	},

	getLong: async function (){
		return this.getInt64()
	},

	getSingle: async function(){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 4
		let res = await this.bufferRead(_cursoroffset_old,4)
		res=res.readInt32LE(0).toString(16)
		res = res.substring(1)
		res = Buffer.from(res,'hex')
		res = (res.readInt16LE(0).toString(10))/2
		if (this.debug==1) log (res)
		return res
	},

	getIntDoublePair: async function(){
		let isDebug = this.debug
		if (this.debug == 1) this.debug = 0

		let res = []

		res.count = await this.getInt()
		
		for (let i=1;i<=res.count;i++){
			let res2 = {}
			res2.byte1 = await this.getByte()
			res2.int1 = await this.getInt()
			res2.byte2 = await this.getByte()
			res2.starrating = await this.getDouble()
			res.push(res2)
		}

		if (isDebug == 1) this.debug = 1
		if (this.debug==1) {
			log (res)
		}
		return res
	},

	getTimingPoint: async function(){
		let isDebug = this.debug
		if (this.debug == 1) this.debug = 0
		let res = {}
		res.double1 = await this.getDouble()
		res.double2 = await this.getDouble()
		res.bool1 = await this.getBool()
		if (isDebug == 1) this.debug = 1
		if (this.debug==1) log (res)
		return res
	},

	getDouble: async function (){
		return this.getInt64()
	},

	buff2int: async function(hex){
		return await this.bin2int(await this.hex2bin(await this.changeEndianness(await this.buffer2hexstr(hex))))
	},

	getString: async function(){
		let isDebug = this.debug
		if (this.debug == 1) this.debug = 0
		let stringCode = await this.getInt8()
		if (stringCode == 11){
			let stringLength = await this.getInt8()
			let res = (await this.getStringBytes(stringLength)).toString('utf8')
			if (isDebug == 1) this.debug = 1
			if (this.debug==1) log ({String: res,Length:stringLength})
			return res
		} else {
			let stringCode = await this.getInt8()
			if (stringCode == 11){
				let stringLength = await this.getInt8()
				let res = (await this.getStringBytes(stringLength)).toString('utf8')
				if (isDebug == 1) this.debug = 1
				if (this.debug==1) log ({String: res,Length:stringLength})
				return res
		}
			//log ('error read string')
			//return false
		}
	},

	changeEndianness: async function (string){
	  const result = [];
	  let len = string.length - 2;
	  while (len >= 0) {
	    result.push(string.substr(len, 2));
	    len -= 2;
	  }
	  return result.join('');
	},

	 hex2bin: async function (hex){
	  hex = hex.replace("0x", "").toLowerCase();
	  var out = "";
	  for(var c of hex) {
	    switch(c) {
	      case '0': out += "0000"; break;
	      case '1': out += "0001"; break;
	      case '2': out += "0010"; break;
	      case '3': out += "0011"; break;
	      case '4': out += "0100"; break;
	      case '5': out += "0101"; break;
	      case '6': out += "0110"; break;
	      case '7': out += "0111"; break;
	      case '8': out += "1000"; break;
	      case '9': out += "1001"; break;
	      case 'a': out += "1010"; break;
	      case 'b': out += "1011"; break;
	      case 'c': out += "1100"; break;
	      case 'd': out += "1101"; break;
	      case 'e': out += "1110"; break;
	      case 'f': out += "1111"; break;
	      default: return "";
	    }
	  }

	  return out;
	},

	bufferRead: async function (Offset,Length){
		let res = await this.fd.read(Buffer.alloc(Length),0,Length,Offset)
		return res.buffer
	},

	getStringBytes: async function (length){
		let _cursoroffset_old = this._cursoroffset
		if (length > 0){
			let stringType = await this.getInt8withoutOffset(await this.bufferRead(_cursoroffset_old,1))
			if (stringType == 1) {
				log ('type '+stringType)
				this._cursoroffset += 1
				this._cursoroffset += length	
				let res2 = await this.bufferRead(_cursoroffset_old,length)

			} else {
				this._cursoroffset += length	
			}
		} else {
			this._cursoroffset += length
		}
		let res = await this.bufferRead(_cursoroffset_old,length)
			
		
		return res
	},

	getInt64: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 8
		let res = await this.buff2int(await this.bufferRead(_cursoroffset_old,8))
		if (this.debug==1) log (res)
		return res
	},

	getInt32: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 4
		let res = await this.buff2int(await this.bufferRead(_cursoroffset_old,4))
		if (this.debug==1) log (res)
		return res
	},

	getInt16: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 2
		let res = await this.buff2int(await this.bufferRead(_cursoroffset_old,2))
		if (this.debug==1) log (res)
		return res
	},

	getInt8: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 1
		let res = await this.buff2int(await this.bufferRead(_cursoroffset_old,1))
		if (this.debug==1) log (res)
		return res
	},

	getInt8withoutOffset: async function (){
		let res = await this.buff2int(await this.bufferRead(this._cursoroffset,1))
		if (this.debug==1) log (res)
		return res
	},

	bin2int: async function(binary){
		return parseInt(binary,2)
	},

	hex2int: async function(hex){
		return parseInt(hex,16)
	},

	int2hex: async function (int){
		return int.toString(16)
	},

	buffer2hexstr: async function (BufferHex){
		return BufferHex.toString('hex')
	}
}