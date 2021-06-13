function readTable(fname, dict=false) {
    var file 		= require('fs').readFileSync('./bin/tables/'+fname, {encoding:'utf8', flag:'r'}),
        string      = file.replace(/_|"/g, ''),//.toLowerCase(),
		lines 		= string.split('\r\n'),
		columns 	= lines.shift().replace(/ /g, '').toLowerCase().split('	'), // Column names lowercased
		rows 		= !dict ? [] : {},
		row 		= {},
		expansion	= string.indexOf('Expansion') === -1 ? 1 : 0,
        rowData, i, ind = 0;
        
	lines.pop();
    
    for (i = 0; i < lines.length; i++) {
		rowData = lines[i].split('	');
        
        if (rowData[0] == 'Expansion') {
			expansion = 1;
			continue;
		}
        
        row = {rowindex:ind};
        
        for (var n = 0; n < rowData.length; n++) {
			if (row[columns[n]]) continue; // Some tables have duplicate columns
			row[columns[n]] = isNaN(+rowData[n]) ? rowData[n] : +rowData[n];
		}
        
        row.expansion = expansion;
		if (!dict) rows.push(row);
		if (dict)  rows[rowData[0]] = row;
		ind++;
	}
    
    //console.log('Parsed table with ' + (rows.length || Object.keys(rows).length) + ' rows');
	//console.log(rows);
	return rows;
}

const BaseItem		= [].concat(readTable('weapons.txt'), readTable('armor.txt'), readTable('misc.txt'));
const ItemType		= readTable('ItemTypes.txt');
const ItemStat		= readTable('ItemStatCost.txt');
const RarePrefix	= readTable('RarePrefix.txt');
const RareSuffix	= readTable('RareSuffix.txt');
const MagicPrefix	= readTable('MagicPrefix.txt');
const MagicSuffix	= readTable('MagicSuffix.txt');
const SetItem		= readTable('SetItems.txt');
const Color 		= readTable('colors.txt');
const Runeword		= readTable('Runes.txt');
const Unique		= readTable('UniqueItems.txt');

const BaseCodeIndex	= {}; // Base code: row index
const ItemStatIndex	= {}; // Stat: row index
const TypeCodeIndex	= {}; // Item type code: row index 
const SetItemIndex	= {}; // Set item name: row index
const SetCodeIndex	= {}; // TODO List of set baseitem codes that are only present once (distinct): row index
const ColorCodeIndex= {}; // Color code: row index
const RunewordIndex	= {}; // Runeword Name (ie Runeword96): row index

{ // Populate dicts
	for (let i = 0; i < BaseItem.length; i++) BaseCodeIndex[BaseItem[i].code] = i;
	for (let i = 0; i < ItemStat.length; i++) ItemStatIndex[ItemStat[i].stat] = i;
	for (let i = 0; i < ItemType.length; i++) TypeCodeIndex[ItemType[i].code] = i;
	for (let i = 0; i < SetItem.length;  i++) SetItemIndex[SetItem[i].index]  = i;
	for (let i = 0; i < Color.length;	 i++) ColorCodeIndex[Color[i].code]   = i;
	for (let i = 0; i < Runeword.length; i++) RunewordIndex[parseInt(Runeword[i].name.replace(/\D/g, ''))] = i;
	for (let i = 0; i < ItemType.length; i++) {
		if (!ItemType[i].code) {
			ItemType[i].types = [];
			continue;
		}

		const types = [];
		const equivs = [ItemType[i].code];
		
		while (equivs.length) {
			let equiv = equivs.shift();
			const {equiv1, equiv2, rowindex} = ItemType[TypeCodeIndex[equiv]];

			types.push(rowindex);
			if (equiv1) equivs.push(equiv1);
			if (equiv2) equivs.push(equiv2);
		}

		ItemType[i].types = [...new Set(types)];
	}
}

// Tables
module.exports.BaseItem		= BaseItem;
module.exports.ItemType		= ItemType;
module.exports.ItemStat		= ItemStat;
module.exports.RarePrefix	= RarePrefix;
module.exports.RareSuffix	= RareSuffix;
module.exports.MagicPrefix	= MagicPrefix;
module.exports.MagicSuffix	= MagicSuffix;
module.exports.SetItem		= SetItem;
module.exports.Color		= Color;
module.exports.Runeword		= Runeword;
module.exports.Unique		= Unique;

// Dicts
module.exports.BaseCodeIndex	= BaseCodeIndex;
module.exports.TypeCodeIndex	= TypeCodeIndex;
module.exports.ItemStatIndex	= ItemStatIndex;
module.exports.SetItemIndex		= SetItemIndex;
module.exports.SetCodeIndex		= SetCodeIndex;
module.exports.ColorCodeIndex	= ColorCodeIndex;
module.exports.RunewordIndex	= RunewordIndex;
