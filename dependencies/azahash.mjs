const ROUND_CONSTANTS = [
    0x3e4bd9d4n, 0x13ee297an, 0xc03c7bf7n, 0x7a546400n,
    0xa12bae22n, 0x5d71011fn, 0xef9a1b40n, 0x3784dda4n,
    0x0249eb4cn, 0xb47df8e7n, 0xe5327fedn, 0x90c05d6dn,
    0x84c5f06en, 0x23e75584n, 0xcd49f979n, 0x03763f31n
  ];
  
  function toBytes(string) {
    return new TextEncoder().encode(string);
  }
  
  function pad(bytes) {
    let L = bytes.length;
    let padlen = (32 - ((L + 1 + 8) % 32)) % 32;
    let totalLen = L + 1 + padlen + 8;
  
    let padded = new Uint8Array(totalLen);
    padded.set(bytes);
    
    padded[L] = 0x80;
    
    let bitLen = L * 8;
    for (let i = 0; i < 8; i++) {
      padded[totalLen - i - 1] = (bitLen >>> (i * 8)) & 0xff;
    }
    
    return padded;
  }
  
  function getBlocks(paddedMessage) {
    let blocks = [];
    for (let i = 0; i < paddedMessage.length; i += 32) {
      blocks.push(paddedMessage.slice(i, i + 32));
    }
    return blocks;
  }
  
  function rotateLeft64(x, n) {
    n = Number(n);
    n = n % 64;
    if (n < 0) n += 64;
    return ((x << BigInt(n)) | (x >> BigInt(64 - n))) & 0xFFFFFFFFFFFFFFFFn;
  }
  
  function round(state, roundIndex, roundConstant) {
    let chosenIndex = roundIndex % 4;
    let chosen = state[chosenIndex];
    let [A, B, C, D] = state;
  
    let mix1 = rotateLeft64(A + B, 17) ^ rotateLeft64(C ^ D, 43);
    let mix2 = rotateLeft64(B + C, 29) ^ rotateLeft64(D ^ A, 3);
    let temp = (mix1 + mix2) ^ roundConstant;
  
    let newVal = rotateLeft64(temp + chosen, 37) ^ rotateLeft64(A + D, 11);
  
    let newState = state.map((v, i) => {
      if (i === chosenIndex) return newVal;
      const rotated = rotateLeft64(
        (v + newVal) ^ state[(i + 1) % 4], 
        (7 * (i + roundIndex)) % 64
      );
      return rotated;
    });
  
    return newState;
  }
  
  function bytesToBigInt64(bytes, offset) {
    let result = 0n;
    for (let i = 0; i < 8; i++) {
      result |= BigInt(bytes[offset + i]) << BigInt(8 * (7 - i));
    }
    return result;
  }
  
  function hashDigest(message) {
    let bytes = toBytes(message);
    let padded = pad(bytes);
    let blocks = getBlocks(padded);
  
    let state = [
      0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn,
      0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n
    ];
  
    for (let block of blocks) {
      let subblocks = [
        bytesToBigInt64(block, 0),
        bytesToBigInt64(block, 8),
        bytesToBigInt64(block, 16),
        bytesToBigInt64(block, 24)
      ];
  
      for (let i = 0; i < 4; i++) {
        state[i] = (state[i] + subblocks[i]) & 0xFFFFFFFFFFFFFFFFn;
      }
  
      for (let roundIndex = 0; roundIndex < 32; roundIndex++) {
        state = round(state, roundIndex, ROUND_CONSTANTS[roundIndex % 16]);
      }
    }
  
    let output = new Uint8Array(32);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        output[i * 8 + j] = Number((state[i] >> BigInt((7 - j) * 8)) & 0xffn);
      }
    }
  
    return output;
  }

  function getHashCode(digest){
    return Array.from(digest).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  let digest = hashDigest("hi I am rohit I am an engineering studeet");

  console.log(getHashCode(digest));