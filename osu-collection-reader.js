var log = console.log.bind(console)
var fs = require('fs')
var path = require('path')

var fd 
var cursoroffset = 0

var debug = 1

var collection = {

dataBuffer: Buffer.alloc(0),

data: [],

run: async function(){

	var collectionfile = 'C:\\Osu\\collection.db'
	var collectionsJson = 'collections.json'

	var stats = await fs.statSync(collectionfile)
	var fileSizeInBytes = stats.size
	this.dataBuffer = Buffer.alloc(fileSizeInBytes)

	cursoroffset = 0

	fd = await fs.promises.open(collectionfile,'r')

	this.data.version = await getInt16()
	this.data.collectionsLength = await getInt16()
	this.data.collections = []

	for (let cc = 1; cc <= this.data.collectionsLength; cc++){

		let collectionName = await getString()
		let collectionCount = await getInt16()
		let hashes = []

		for (let i = 1; i<= collectionCount; i++){
			let hash = await getString()
			hashes.push(hash)
		}

		this.data.collections.push({[collectionName]: hashes, collectionLength: collectionCount })

	}

	fd.close()

	log (this.data)
	var collectionsJsonData = await JSON.stringify({ ...this.data})
	var colJsonFile = await fs.promises.open(collectionsJson,'w')
	await colJsonFile.writeFile(collectionsJsonData)
	await colJsonFile.close()
}}

function getInt(hex){
	return bin2int(hex2bin(changeEndianness(buffer2hexstr(hex))))
}

async function getString(){
	let stringCode = await getInt4()
	if (stringCode == 11){
		let stringLength = await getInt4()
		res = (await getStringBytes(stringLength)).toString('utf8')
		if (debug==1) log (res)
		return res
	} else {
		log ('error read string')
		return false
	}
	
}

function bin2int(binary){
	return parseInt(binary,2)
}

const changeEndianness = (string) => {
  const result = [];
  let len = string.length - 2;
  while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
  }
  return result.join('');
}

function hex2bin(hex){
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
}

async function getStringBytes(length){
	let cursoroffset_old = cursoroffset
	cursoroffset += length
	let res = await bufferRead(cursoroffset_old,length)
	//if (debug==1) log (res)
	return res
}

async function getInt32(){
	let cursoroffset_old = cursoroffset
	cursoroffset += 8
	let res = getInt(await bufferRead(cursoroffset_old,8))
	if (debug==1) log (res)
	return res
}

async function getInt16(){
	let cursoroffset_old = cursoroffset
	cursoroffset += 4
	let res = getInt(await bufferRead(cursoroffset_old,4))
	if (debug==1) log (res)
	return res
}

async function getInt8(){
	let cursoroffset_old = cursoroffset
	cursoroffset += 2
	let res = getInt(await bufferRead(cursoroffset_old,2))
	if (debug==1) log (res)
	return res
}

async function getInt4(){
	let cursoroffset_old = cursoroffset
	cursoroffset += 1
	let res = getInt(await bufferRead(cursoroffset_old,1))
	if (debug==1) log (res)
	return res
}


async function bufferRead(Offset,Length){
	let res = await fd.read(Buffer.alloc(Length),0,Length,Offset)
	return res.buffer
}


async function hex2int(hex){
	return parseInt(hex,16)
}

function int2hex(int){
	return int.toString(16)
}

function buffer2hexstr(BufferHex){
	return BufferHex.toString('hex')
}


main = async function(){
	return (await collection.run())
}
main()