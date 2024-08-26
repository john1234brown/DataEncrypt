# Documentaion
## Introduction
Made by Johnathan Edward Brown With the help of a few AI Models such as Claude3, ChatGPT, and Gemini they provided boilerPlate code and I just attempted to work out environment related Key into the original completely randomized Kek and key design provided by AI then worked on implementing a Argon hashing system to eventually include a salt deriving method along with the key deriving method for the final layer of security

This is a clear concise Full Starter Template Design Utility Module to start Encrypting in a moderately robust secure way!

##  Secure Data Storage with Password Rotation Base Template Design
### Utilizes Argon2 With AES-256-GCM with additional salt deriving for true skeleton key from environment variable!
This code implements a secure data storage system with password rotation for added protection. Let's break down the functionalities and explore parallelism adjustments.

**Core Functionalities:**

1. **Security Lock:**
   - Checks environment variables for authentication before proceeding.

2. **Master Key Management:**
   - Generates a secure random `ANCESTOR_MASTER_KEY` (AMK) for skeleton key derivation.
   - Provides functions for saving and loading the master key using Argon2 for key derivation and encryption with random salts.

3. **Encryption and Decryption:**
   - Uses `crypto.randomBytes` to generate random keys and initialization vectors (IVs) for encryption.
   - Employs Argon2 for password-based key derivation using the `argon2.argon2id` type.
   - Encrypts and decrypts data with AES-256-GCM for secure storage.

4. **Password Rotation:**
   - Periodically rotates the password used for encryption using `setInterval`.
   - Loads the existing master key or generates a new one if not found.
   - Decrypts data with the old password.
   - Generates a new password and encrypts data with the new password.
   - Saves the new master key with the new password and a newly generated AMK.

5. **Parallelism Adjustment:**
   - The code uses `argon2.hash` with a `parallelism` option set to 2 for Argon2.
   - This value can be adjusted based on your CPU architecture for optimal performance.
   - Generally, the number of cores available on your CPU is a good starting point for parallelism.

**Adjusting Parallelism:**

- To reduce CPU load, you can experiment with lower `parallelism` values (e.g., 1).
- However, this might increase processing time.
- You can monitor CPU usage using tools like `htop` or `top` to find the sweet spot between security and performance.
- Finding the optimal parallelism depends on your specific hardware and workload.

**Additional Considerations:**

- This code utilizes environment variables for sensitive information like security strings. Ensure proper handling and protection of these variables.
- Regularly back up your encrypted data file (`encrypted_data.json`) for disaster recovery.
- Consider implementing a user interface for interacting with the encryption and decryption functionalities.

**Documentation:**

The code includes comments explaining the functionalities of different sections. Consider adding more detailed comments for clarity, especially in crucial areas like key management and password rotation.

**Overall, this code provides a solid foundation for secure data storage with password rotation. By adjusting parallelism and understanding the impact on performance, you can optimize the system for your specific needs.**