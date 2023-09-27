'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE features
            ADD COLUMN IF NOT EXISTS epic text;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE features
            DROP COLUMN IF EXISTS epic;
        `,
        cb,
    );
};
