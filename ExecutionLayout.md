# The Execution Layout

**For a secure wallet ledger system we need to properly follow this project layout design structure!**

**Doing this will help optimize said application entirely by reducing the need for redundant extra securitys required using eventEmitters, webSockets, sharedObjects**

**We could have utilized a process.env.variable as well to utilze storing globally**



**Numbered in executing order starting from 0**

- **0** **test.js** *which will be the test wallet ledger starter!*

- **1** **reobby.js** *Which is the mitm per say which obfuscates the vault and allows communicating with it!*

- **2** **debugindex.js** *Which is the Vault system setup in our heirachy! Design structure here today!*

