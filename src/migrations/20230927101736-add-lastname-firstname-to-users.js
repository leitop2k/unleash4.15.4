'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS lastname character varying,
        ADD COLUMN IF NOT EXISTS firstname character varying;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE users 
        DROP COLUMN IF EXISTS lastname,
        DROP COLUMN IF EXISTS firstname;
        `,
        cb,
    );
};
