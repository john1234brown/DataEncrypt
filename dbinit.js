const Database = require('better-sqlite3');
const db = new Database(process.env.DATABASE_LOCATION);

function init(){
    if (process.env.USE_BUFFER === 'true'){
        db.exec('CREATE TABLE IF NOT EXISTS "security" ("masterKey"	BLOB, "encryptedData" BLOB);');
        const exists = db.prepare('SELECT CASE WHEN (SELECT COUNT(*) FROM security WHERE rowid=1) > 0 THEN 1 ELSE 0 END AS count').get().count;
        console.log('exists:', exists);
        if (exists === 0){//Doesnt exist lets fix so program can properly work!
            console.log('It doesnt exist adding first rowId 1 for database', exists);
            db.exec('INSERT INTO security (masterKey, encryptedData) values(null, null)');
        }
    }else{
        db.exec('CREATE TABLE IF NOT EXISTS "security" ("masterKey"	TEXT, "encryptedData" TEXT);');
        const exists = db.prepare('SELECT CASE WHEN (SELECT COUNT(*) FROM security WHERE rowid=1) > 0 THEN 1 ELSE 0 END AS count').get().count;
        console.log('exists:', exists);
        if (exists === 0){//Doesnt exist let fix so program can properly work!
            console.log('It doesnt exist adding first rowId 1 for database', exists);
            db.exec('INSERT INTO security (masterKey, encryptedData) values(null, null)');
        }
    }
}
init();

async function updateEncrypt(encryptData){
    // Convert JSON to a string
    const jsonString = JSON.stringify(encryptData);

    // Convert string to a byte array
    const buffer = Buffer.from(jsonString, 'utf8');
    const exists = db.prepare('SELECT CASE WHEN (SELECT COUNT(*) FROM security WHERE rowid=1) > 0 THEN 1 ELSE 0 END AS count').get();
    if (exists === 0){
        //We add it to it!
        if (process.env.USE_BUFFER === 'true'){
            db.prepare('INSERT INTO security (masterKey, encryptedData) VALUES(null, ?)').run(buffer);
        }else{
            db.prepare('INSERT INTO security (masterKey, encryptedData) VALUES(null, ?)').run(jsonString);
        }
        return;
    }else{
        //We update!
        if (process.env.USE_BUFFER === 'true'){
            db.prepare('INSERT INTO security (masterKey, encryptedData) VALUES(null, ?)').run(buffer);
        }else{
            db.prepare('UPDATE security SET encryptedData=? WHERE rowid=1').run(jsonString);
        }
        return;
    }
}

async function updateMaster(masterData){
    // Convert JSON to a string
    const jsonString = JSON.stringify(masterData);
    // Convert string to a byte array
    const buffer = Buffer.from(jsonString, 'utf8');
    const exists = db.prepare('SELECT CASE WHEN (SELECT COUNT(*) FROM security WHERE rowid=1) > 0 THEN 1 ELSE 0 END AS count').get();
    if (exists === 0){
        //We add it to it!
        if (process.env.USE_BUFFER === 'true'){
            db.prepare('INSERT INTO security (masterKey, encryptedData) VALUES(?, null)').run(buffer);
        }else{
            db.prepare('INSERT INTO security (masterKey, encryptedData) VALUES(?, null)').run(jsonString);
        }
        return;
    }else{
        //We update!
        if (process.env.USE_BUFFER === 'true'){
            db.prepare('INSERT INTO security (masterKey, encryptedData) VALUES(?, null)').run(buffer);
        }else{
            db.prepare('UPDATE security SET masterKey=? WHERE rowid=1').run(jsonString);
        }
        return;
    }
}

module.exports = {
    db,
    updateEncrypt,
    updateMaster
}