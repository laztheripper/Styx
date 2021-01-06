function readTable(fname, mode=false) {
    var file 		= require('fs').readFileSync('./bin/tables/'+fname, {encoding:'utf8', flag:'r'}),
        string      = file.replace(/_|"/g, ''),//.toLowerCase(),
		lines 		= string.split('\r\n'),
		columns 	= lines.shift().replace(/ /g, '').toLowerCase().split('	'), // Column names lowercased
		rows 		= !mode ? [] : {},
		row 		= {},
		expansion	= string.indexOf('Expansion') === -1 ? 1 : 0,
        rowData, i;
        
	lines.pop();
    
    for (i = 0; i < lines.length; i++) {
		rowData = lines[i].split('	');
        
        if (rowData[0] == 'Expansion') {
			expansion = 1;
			continue;
		}
        
        row = {};
        
        for (var n = 0; n < rowData.length; n++) {
			if (row[columns[n]]) continue; // Some tables have duplicate columns
			row[columns[n]] = isNaN(+rowData[n]) ? rowData[n] : +rowData[n];
		}
        
        row.expansion = expansion;
		if (!mode) rows.push(row);
		if (mode)  rows[rowData[0]] = row;
	}
    
    console.log('Parsed table with ' + (rows.length || Object.keys(rows).length) + ' rows');
	//console.log(rows);
	return rows;
}

module.exports.BaseItem = [].concat(
    readTable('weapons.txt'),
    readTable('armor.txt'),
    readTable('misc.txt')
);
