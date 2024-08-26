const crypto = require('node:crypto');
const fs = require('fs').promises;
const fs2 = require('fs');
const os = require('os');
const path = require('path');
const argon2 = require('argon2');
require('dotenv').config();
const {
  db,
  updateEncrypt,
  updateMaster
} = require('./dbinit.js');
require('./emitter.js');
const AvailableParallelism = os.availableParallelism();
console.log('Database:', db);
async function securityLock() {
  if (process.env.NXeCjvvZQeuE) {
    if (process.env.cryfKWlKqbpr) {
      if (process.env.cryfKWlKqbpr == process.env.NXeCjvvZQeuE) {
        console.log('Success!');
        //console.log('Saltty:', await deriveSalt(process.env.EXTRA_SECURITY_KEY, crypto.randomBytes(8)));
        //Unlock fine perfectly!
        return;
      } else {
        //Here we exit them out to prevent them access!
        console.log('Error mismatching environment variables! exiting!');
        process.exit(0);
      }
    } else {
      console.log('Error mismatching environment variables! exiting!');
      process.exit(0);
    }
  } else {
    console.log('Error mismatching environment variables! exiting!');
    process.exit(0);
  }
}
securityLock();

// Function to generate a random password
function generatePassword() {
  return crypto.randomBytes(32); // Generate a secure random 32-byte password
}
// Function to derive a key using Argon2
async function deriveKey(password, salt) {
  const hash = await argon2.hash(password, {
    salt,
    type: argon2.argon2id,
    hashLength: 32,
    // 32 bytes (256 bits)
    timeCost: 2,
    memoryCost: 1024,
    parallelism: AvailableParallelism,
    // To dynamically work based on available paralleism
    raw: true // Raw binary output
  });
  return hash; // Return the derived key directly
}
async function deriveSalt(password, salt) {
  /*const json = {
    "password": password,
    "salt": salt,
  }
  console.log('Deriving Salt:', JSON.stringify(json, null, 2));*/
  const hash2 = await argon2.hash(password, {
    salt,
    type: argon2.argon2id,
    hashLength: 16,
    // 32 bytes (256 bits)
    timeCost: 2,
    memoryCost: 1024,
    parallelism: AvailableParallelism,
    raw: true // Raw binary output
  });
  return hash2; // Return the derived key directly
}

// Ancestor Master Key (AMK) - Securely generated and stored
const NIkjNLZOLZpX = crypto.randomBytes(32); // Replace with a securely generated key
let jCzUalBraOLi = NIkjNLZOLZpX;
let CbDQiYsQfYSy = "AES_STRING_OF_TEXT";
async function setAES(Key, salt) {
  //Type check added and suggested by Vampeyer as this poses backdoor threat for malicious hackers!
  //He was taught by his mentor in two different programming languages that 
  //A type check especially one on a input function is a core security principals!
  let string;
  try {
    console.log('Key:', Key, 'Salt:', salt);
    string = await deriveKey(Key, salt);
  } catch (err) {
    console.log(err.code);
    console.log(err);
  }
  if (string != null && string != undefined) {
    const stringHex = string.toString('hex');
    console.log('String:', string);
    const pattern = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/; //Ensure only hexadecimals!
    if (string != null && string != undefined && typeof string === 'string' && pattern.test(stringHex)) {
      CbDQiYsQfYSy = stringHex;
    }
    return;
  }
}
function getAES() {
  return CbDQiYsQfYSy;
}
process.env.wsOpdQYachlk = crypto.randomBytes(16).toString('hex');
process.env.OsLhlfLSckal = crypto.randomBytes(32).toString('hex');
if (getAES() === "AES_STRING_OF_TEXT") {
  //Then we need to update the vault with context of our key!
  console.log('Setting encryption Key securely!');
  setAES(Buffer.from(process.env.OsLhlfLSckal, 'hex'), Buffer.from(process.env.wsOpdQYachlk, 'hex'));
} else {
  //We load key from vault and use in runetime!
  console.log('Hey it exists in context already!');
  process.env.OsLhlfLSckal = Buffer.from(getAES(), 'hex'); //Specify to retreive back to a key buffer in memory to use
}
function getAvailableParallelism() {
  const total = AvailableParallelism;
  if (total > 2) {
    return total;
  } else {
    return 2;
  }
}
const originalConsole = console;
const debug = true;
/*console.log = function(...args) {
    if (debug){
    // Your custom logic here
    originalconsole.log(...args); // Or omit this to completely suppress output
    }
    return;
};*/
let isProcessing;
//Test derive start on startup!

// Function to encrypt data with a given key
async function encryptData(data, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encryptedData = cipher.update(data, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData
  };
}

// Function to decrypt data with a given key
async function decryptData(encryptedData, iv, authTag, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}

// Encrypt function
async function encrypt(password, dataToEncrypt) {
  try {
    const salt = crypto.randomBytes(16);

    // Derive the key using Argon2
    const key = await deriveKey(password, salt);

    // Encrypt data with the derived key
    const encryptedData = await encryptData(dataToEncrypt, key);
    const data = {
      iv: encryptedData.iv,
      salt: salt.toString('hex'),
      authTag: encryptedData.authTag,
      encryptedData: encryptedData.encryptedData
    };
    if (process.env.FU_yAEEGvqEP === 'true') {
      await updateEncrypt(data);
      return;
    } else {
      await fs.writeFile('encrypted_data.json', JSON.stringify(data));
      return;
    }
  } catch (error) {
    console.error('Encryption error:', error);
  }
}

// Decrypt function
async function decrypt(password) {
  try {
    if (process.env.FU_yAEEGvqEP === 'true') {
      var datafr0mDB;
      if (process.env.SoJKZmcwFOTh === 'true') {
        datafr0mDB = JSON.parse(db.prepare('SELECT encryptedData FROM security WHERE rowid=1').get().encryptedData.toString('utf8'));
      } else {
        datafr0mDB = JSON.parse(db.prepare('SELECT encryptedData FROM security WHERE rowid=1').get().encryptedData);
      }
      console.log('Decryption JSON:', JSON.stringify(datafr0mDB, null, 2));
      const iv = datafr0mDB.iv;
      const salt = Buffer.from(datafr0mDB.salt, 'hex');
      const authTag = datafr0mDB.authTag;
      const encryptedData = datafr0mDB.encryptedData;

      // Derive the key using Argon2
      const key = await deriveKey(password, salt);

      // Decrypt data with the derived key
      const decryptedString = await decryptData(encryptedData, iv, authTag, key);
      return decryptedString;
    } else {
      const data = JSON.parse(await fs.readFile('encrypted_data.json'));
      const iv = data.iv;
      const salt = Buffer.from(data.salt, 'hex');
      const authTag = data.authTag;
      const encryptedData = data.encryptedData;

      // Derive the key using Argon2
      const key = await deriveKey(password, salt);

      // Decrypt data with the derived key
      const decryptedString = await decryptData(encryptedData, iv, authTag, key);

      //console.log('Decrypted String:', decryptedString);
      return decryptedString;
    }
  } catch (error) {
    //console.error('Decryption error:', error);
    return null;
  }
}

// Function to save the master key securely
// Function to encrypt and save the master key
async function saveMasterKey(masterKey, ancestorMasterKey) {
  console.log('starting saving master Key:');
  try {
    //Use Argon to Derive a Docker Environment Variable Lockout Skeleton Key as well This will make a 3 Way Lock solution system which can ensure lock out of malicious Actors
    const extraSalty = crypto.randomBytes(16);
    console.log('Extra Salty is:', extraSalty.toString('hex'));
    const LockOutSalt = await deriveSalt(process.env.UMO_BhpdOskf, extraSalty);
    console.log('Made it here on saving master Key also!');
    console.log('LockOutSalt is :', LockOutSalt.toString('hex'));
    const LockOutKey = await deriveKey(process.env.cryfKWlKqbpr, LockOutSalt);
    console.log('Made it here on saving master key!');
    console.log('LockoutKey is :', LockOutKey.toString('hex'));
    const encryptLockOutKey = await encryptData(LockOutKey.toString('hex'), LockOutKey);
    console.log('Encrypt Lock out key success!');

    //Use Argon to derive Skeleton Key to make more secure then storing pure Skeleton key in context of master key!
    const iv = generatePassword(); // Skelly for the encrypted Skelly!
    const salt2 = crypto.randomBytes(32); //Another to throw off users!
    const salt4 = crypto.randomBytes(32);
    const salt5 = crypto.randomBytes(32);
    const salt6 = crypto.randomBytes(32);
    const saltd2 = crypto.randomBytes(32);
    const saltd3 = crypto.randomBytes(32);
    const saltd4 = crypto.randomBytes(32);
    const saltd5 = crypto.randomBytes(32);
    const saltd6 = crypto.randomBytes(32);
    const saltd7 = crypto.randomBytes(32);
    const encryptSkelly = await encryptData(ancestorMasterKey.toString('hex'), LockOutKey);

    //Here we encrypt master key with encrypted skellyKey

    const encryptedMasterKey = await encryptData(masterKey.toString('hex'), ancestorMasterKey);
    const userDir = path.join(os.homedir(), '.secure_storage');
    await fs.mkdir(userDir, {
      recursive: true
    });
    const masterKeyFile = path.join(userDir, 'master_key.json');
    const data = {
      lockoutKey: encryptLockOutKey,
      //Properly Derive the key with a salt!
      ancestorKey: encryptSkelly,
      // Save the AMK
      salt2: extraSalty.toString('hex'),
      //To Truly be secure we also encrypt our salt as well this is the final completion to the product!
      salt3: salt2.toString('hex'),
      //Is LockOutSalt is the true key answer to it all! //Is our true salt to get and retain memory for the decryption of skeleton ancestorKey. Which doesn't leak the actual salt!
      salt4: salt4.toString('hex'),
      salt5: salt5.toString('base64'),
      //So we have restructured to utilize a LockoutKey design this key is generated using a process.env string! this is the key used to encrypt skeleton ancestor key 
      salt6: salt6.toString('hex'),
      //Doing so makes a 3 way lock solution with lock out design! allowing proper re creation of the lock chain as well incase of errors!
      saltd2: saltd2.toString('hex'),
      saltd3: saltd3.toString('hex'),
      saltd4: saltd4.toString('hex'),
      saltd5: saltd5.toString('hex'),
      saltd6: saltd6.toString('hex'),
      saltd7: saltd7.toString('hex'),
      salt7: iv.toString('hex'),
      //Before we where saving the encrypted data with the master key in context still this is bad practice!
      encryptedMasterKey: encryptedMasterKey
    };
    if (process.env.FU_yAEEGvqEP === 'true') {
      await updateMaster(data);
    } else {
      await fs.writeFile(masterKeyFile, JSON.stringify(data, null, 2));
    }
    console.log('Master key saved to:', masterKeyFile);
  } catch (err) {
    console.log('Saving Master Key Error:', err);
  }
}

// Function to load and decrypt the master key
async function loadMasterKey() {
  try {
    if (process.env.FU_yAEEGvqEP === 'true') {
      const dbData = db.prepare('SELECT masterKey from security WHERE rowid=1').get();
      console.log('TESTING:', dbData);
      const data = JSON.parse(dbData.masterKey.toString('utf8'));
      console.log('On startup Master Key data:', JSON.stringify(data, null, 2));
      console.log('\n\n\nStarting Process to decrypt!');
      const encryptedLockOutKey = {
        iv: data.lockoutKey.iv,
        authTag: data.lockoutKey.authTag,
        encryptedData: data.lockoutKey.encryptedData
      };
      console.log('Encrypted Lockout Key data:', JSON.stringify(encryptedLockOutKey));
      console.log('process:', process.env.UMO_BhpdOskf, '\n Salt:', Buffer.from(data.salt3, 'hex'));
      const extraSaltyLockoutSalt = await deriveSalt(process.env.UMO_BhpdOskf, Buffer.from(data.salt2, 'hex'));
      console.log('Extra salty lockoutSalt hex:', extraSaltyLockoutSalt.toString());
      const extraSaltyLockoutKey = await deriveKey(process.env.cryfKWlKqbpr, extraSaltyLockoutSalt);
      console.log('Extra Salty Key hex:', extraSaltyLockoutKey.toString('hex'));
      const LockOutKeyHex = await decryptData(encryptedLockOutKey.encryptedData, encryptedLockOutKey.iv, encryptedLockOutKey.authTag, extraSaltyLockoutKey);
      console.log('LockOutKey Hex:', LockOutKeyHex);
      const LockOutKey = Buffer.from(LockOutKeyHex, 'hex');
      const encryptedAncestorMasterKey = {
        iv: data.ancestorKey.iv,
        authTag: data.ancestorKey.authTag,
        encryptedData: data.ancestorKey.encryptedData
      };
      const ancestorMasterKeyHex = await decryptData(encryptedAncestorMasterKey.encryptedData, encryptedAncestorMasterKey.iv, encryptedAncestorMasterKey.authTag, LockOutKey);
      const ancestorMasterKey = Buffer.from(ancestorMasterKeyHex, 'hex');
      const encryptedMasterKey = {
        iv: data.encryptedMasterKey.iv,
        authTag: data.encryptedMasterKey.authTag,
        encryptedData: data.encryptedMasterKey.encryptedData
      };
      const masterKeyHex = await decryptData(encryptedMasterKey.encryptedData, encryptedMasterKey.iv, encryptedMasterKey.authTag, ancestorMasterKey);

      //console.log('Loaded Master Key in hex:', masterKeyHex);
      return Buffer.from(masterKeyHex, 'hex');
    } else {
      const userDir = path.join(os.homedir(), '.secure_storage');
      const masterKeyFile = path.join(userDir, 'master_key.json');
      const data = JSON.parse(await fs.readFile(masterKeyFile));
      console.log('On startup Master Key data:', JSON.stringify(data, null, 2));
      console.log('\n\n\nStarting Process to decrypt!');
      const encryptedLockOutKey = {
        iv: data.lockoutKey.iv,
        authTag: data.lockoutKey.authTag,
        encryptedData: data.lockoutKey.encryptedData
      };
      console.log('Encrypted Lockout Key data:', JSON.stringify(encryptedLockOutKey));
      console.log('process:', process.env.UMO_BhpdOskf, '\n Salt:', Buffer.from(data.salt3, 'hex'));
      const extraSaltyLockoutSalt = await deriveSalt(process.env.UMO_BhpdOskf, Buffer.from(data.salt2, 'hex'));
      console.log('Extra salty lockoutSalt hex:', extraSaltyLockoutSalt.toString());
      const extraSaltyLockoutKey = await deriveKey(process.env.cryfKWlKqbpr, extraSaltyLockoutSalt);
      console.log('Extra Salty Key hex:', extraSaltyLockoutKey.toString('hex'));
      const LockOutKeyHex = await decryptData(encryptedLockOutKey.encryptedData, encryptedLockOutKey.iv, encryptedLockOutKey.authTag, extraSaltyLockoutKey);
      console.log('LockOutKey Hex:', LockOutKeyHex);
      const LockOutKey = Buffer.from(LockOutKeyHex, 'hex');
      const encryptedAncestorMasterKey = {
        iv: data.ancestorKey.iv,
        authTag: data.ancestorKey.authTag,
        encryptedData: data.ancestorKey.encryptedData
      };
      const ancestorMasterKeyHex = await decryptData(encryptedAncestorMasterKey.encryptedData, encryptedAncestorMasterKey.iv, encryptedAncestorMasterKey.authTag, LockOutKey);
      const ancestorMasterKey = Buffer.from(ancestorMasterKeyHex, 'hex');
      const encryptedMasterKey = {
        iv: data.iv,
        authTag: data.authTag,
        encryptedData: data.encryptedData
      };
      const masterKeyHex = await decryptData(encryptedMasterKey.encryptedData, encryptedMasterKey.iv, encryptedMasterKey.authTag, ancestorMasterKey);

      //console.log('Loaded Master Key in hex:', masterKeyHex);
      return Buffer.from(masterKeyHex, 'hex'); // Convert back to Buffer
    }
  } catch (err) {
    console.log('Error on file load', err);
    throw err;
  }
}

// Function to handle encryption/decryption with password rotation
async function handleEncryptionDecryption() {
  const rotatePassword = async () => {
    if (isProcessing) return; // Prevent dual execution

    isProcessing = true;

    // Load the master key or generate a new one
    let masterKey;
    try {
      masterKey = await loadMasterKey();
    } catch (error) {
      console.log('Generating new master key');
      masterKey = generatePassword();
      //Rotate Skeleton Key
      jCzUalBraOLi = generatePassword();
      await saveMasterKey(masterKey, jCzUalBraOLi); // Save the newly generated master key
    }
    console.log('Master key before decrypt:', masterKey);
    // Decrypt data with the existing password
    const decryptedData = await decrypt(masterKey);
    if (decryptedData === null) {
      try {
        const stat = await fs.stat('encrypted_data.json');
        if (stat) {
          //Here we will properly process as such and declare a new file creation! to fix file corruption!
          //        console.log('Where before error lol!');

          await encrypt(masterKey, CbDQiYsQfYSy);
        }
      } catch (err) {
        //TODO: NEED to include pulling aes string from wallet here so potentially include a event fire trigger to notify main thread to fix!
        //Since this will be a utility class being used to access the aes string of the wallet on restart of node application instance we need to ensure this is properly set at all times!
        console.log('NOPE IT DOESNT EXIST LOL ACTUAL LOL!!!!');
        console.log('Error code:', err.code);
        console.log('Error info:', err.status);
        await encrypt(masterKey, CbDQiYsQfYSy);
      }
      isProcessing = false;
      return; // Decryption failed, abort the rotation
    }
    const newPassword = generatePassword();
    //console.log('New Password:', newPassword.toLocaleString());

    // Encrypt data with the new password
    await encrypt(newPassword, decryptedData);

    //Rotate Skeleton Key!
    jCzUalBraOLi = generatePassword();
    // Save the new master key
    await saveMasterKey(newPassword, jCzUalBraOLi);
    isProcessing = false;
  };

  // Rotate password every .5 seconds for optimal
  setInterval(rotatePassword, 1000);

  // Save the master key on process shutdown
  process.on('exit', async () => {
    console.log('Its exiting!');
    process.exit(0);
  });
}
async function onClose() {
  console.log('Its exiting!');
  if (isProcessing) {
    console.log('Its already process');
    return;
  }
  //console.log('Made it here!');
  isProcessing = true;
  // Load the master key or generate a new one
  let masterKey;
  try {
    masterKey = await loadMasterKey();
  } catch (error) {
    console.log('Generating new master key');
    masterKey = generatePassword();
    //Rotate Skeleton Key
    jCzUalBraOLi = generatePassword();
    await saveMasterKey(masterKey, jCzUalBraOLi); // Save the newly generated master key
  }
  //console.log('Made it here!');

  // Decrypt data with the existing password
  const decryptedData = await decrypt(masterKey);
  if (decryptedData === null) {
    try {
      const stat = await fs.stat('encrypted_data.json');
      if (stat) {
        //Here we will properly process as such and declare a new file creation! to fix file corruption!
        await encrypt(masterKey, CbDQiYsQfYSy);
      }
    } catch (err) {
      console.log('NOPE IT DOESNT EXIST LOL ACTUAL LOL!!!!');
      console.log('Error code:', err.code);
      console.log('Error info:', err.status);
      await encrypt(masterKey, CbDQiYsQfYSy);
    }
    isProcessing = false;
    return; // Decryption failed, abort the rotation
  }
  const newPassword = generatePassword();
  //console.log('New Password:', newPassword.toLocaleString());

  // Encrypt data with the new password
  await encrypt(newPassword, decryptedData);

  //Create New Skeleton Key
  jCzUalBraOLi = generatePassword();

  // Save the new master key
  await saveMasterKey(newPassword, jCzUalBraOLi);
  isProcessing = false;
  return;
}
process.on('SIGINT', async () => {
  console.log('Sig int called');
  await onClose();
  console.log('On close finished!');
  process.exit(0);
});
handleEncryptionDecryption();
module.exports = {
  getAES,
  setAES
};