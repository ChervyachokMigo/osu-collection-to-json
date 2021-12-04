module.exports = {
	_cursoroffset: 0,
	debug: 0,
	fd: 0,
	getInt: function(hex){
		return this.bin2int(this.hex2bin(this.changeEndianness(this.buffer2hexstr(hex))))
	},

	getString: async function(){
		let stringCode = await this.getInt4()
		if (stringCode == 11){
			let stringLength = await this.getInt4()
			let res = (await this.getStringBytes(stringLength)).toString('utf8')
			if (this.debug==1) log (res)
			return res
		} else {
			log ('error read string')
			return false
		}
	},

	changeEndianness: function (string){
	  const result = [];
	  let len = string.length - 2;
	  while (len >= 0) {
	    result.push(string.substr(len, 2));
	    len -= 2;
	  }
	  return result.join('');
	},

	 hex2bin: function (hex){
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
		this._cursoroffset += length
		let res = await this.bufferRead(_cursoroffset_old,length)
		//if (debug==1) log (res)
		return res
	},

	getInt32: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 8
		let res = this.getInt(await this.bufferRead(_cursoroffset_old,8))
		if (this.debug==1) log (res)
		return res
	},

	getInt16: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 4
		let res = this.getInt(await this.bufferRead(_cursoroffset_old,4))
		if (this.debug==1) log (res)
		return res
	},

	getInt8: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 2
		let res = this.getInt(await this.bufferRead(_cursoroffset_old,2))
		if (this.debug==1) log (res)
		return res
	},

	getInt4: async function (){
		let _cursoroffset_old = this._cursoroffset
		this._cursoroffset += 1
		let res = this.getInt(await this.bufferRead(_cursoroffset_old,1))
		if (this.debug==1) log (res)
		return res
	},

	bin2int: function(binary){
		return parseInt(binary,2)
	},

	hex2int: async function(hex){
		return parseInt(hex,16)
	},

	int2hex: function (int){
		return int.toString(16)
	},

	buffer2hexstr: function (BufferHex){
		return BufferHex.toString('hex')
	}
}