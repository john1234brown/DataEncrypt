# Optimization Notes

5. **Parallelism Adjustment:**
   - The code uses `argon2.hash` with a `parallelism` option set to 2 for Argon2.
   - This value can be adjusted based on your CPU architecture for optimal performance.
   - Generally, the number of cores available on your CPU is a good starting point for parallelism.

**Adjusting Parallelism:**

- To reduce CPU load, you can experiment with lower `parallelism` values (e.g., 1).
- However, this might increase processing time.
- You can monitor CPU usage using tools like `htop` or `top` to find the sweet spot between security and performance.
- Finding the optimal parallelism depends on your specific hardware and workload.


## Utilizing a Monolith Design Process

We First start off with a base design of a security vault module which gets obfuscated and started up and references required exported modules!
Need to utilize Monolithic Design and proper Design Hierarchy structure!