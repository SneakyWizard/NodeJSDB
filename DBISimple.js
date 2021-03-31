'use strict';

/* 

	Description: 

		Mysql wrapper class that selects and writes to db's and captures errors.

	Documentation: 

		https://www.npmjs.com/package/mysql

*/

const mysql = require('mysql');

const classname = 'DBI::DBISimple';

// Can be in a config.json.
const default_config = {
	host:         'localhost',
	user:         'ex1',
	password:     'ex1',
	database:     'exdb',
	insecureAuth: true
};

exports.DBISimple = class { 

	// Example: 
	// let binds  = [ 'bindv_1', 'bindv_2' ];  // (binds must be in this order)
	// let result = Mysql.fetch( { sql: 'select * from Exp where field1 = ? and field2 = ?', db_name: 'ex1', binds: binds } );
	async fetch( args ) {

		args = args || [];

		const sql     = args['sql'];
		const binds   = args['binds']  || [];
		const config  = args['config'] || default_config;
		const db_name = args['db_name'];

		const Trace = global.objects.Trace.obj;
		const tpre  = `${classname} fetch`;

		if ( sql ) {

			if ( db_name ) { 
				config.database = db_name;
			}

			// Async.
			return new Promise( res => {

				const connection = mysql.createConnection( config );
				connection.connect();

				connection.query( { sql: sql, values: binds, timeout: 20000 }, async ( error, results, fields ) => {
					if ( !error ) { 
						res( { success: results } );
					} else { 
						console.trace( error );
						await Trace.WriteTrace( { level: 'ERROR', text: `${tpre} ${error}`, stack: new Error().stack } );
						res( { error: error } );
					}
				} );

				connection.end();
			} );

		} else {
			return { error: 'missing sql' };
		}
	}

	// For updates and inserts.
	async save( args ) { 

		const sql     = args['sql'];
		const binds   = args['binds']  || [];
		const config  = args['config'] || default_config;
		const db_name = args['db_name'];

		const Trace = global.objects.Trace.obj;
		const tpre  = `${classname} save`;

		if ( sql ) {

			// Passed db.
			if ( db_name ) { 
				config.database = db_name;
			}

			// Async.
			return new Promise( res => {
				const connection = mysql.createConnection( config );
				connection.connect();

				connection.query( { sql: sql, values: binds, timeout: 20000 }, async ( error, results, fields ) => {
					if ( !error ) { 
						res( { success: { insert_id: results.insertId } } );
					} else { 
						console.trace( error );
						await Trace.WriteTrace( { level: 'ERROR', text: `${tpre} ${error}`, stack: new Error().stack } );
						res( { error: error } );
					}
				} );

				connection.end();
			} );

		} else {
			return { error: 'missing sql' };
		}
	}
}
