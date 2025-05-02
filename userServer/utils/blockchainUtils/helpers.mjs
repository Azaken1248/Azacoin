import crypto from "crypto";
import { hashDigest,getHashCode } from "../../dependencies/azahash.mjs";

export function hexToBigInt(hex) {
    return BigInt('0x' + hex);
}

export function getTargetByDifficulty(difficulty) {
    const prefix = "0".repeat(difficulty);
    const suffixLength = 64 - difficulty;
    const suffix = "f".repeat(suffixLength);
    return prefix + suffix;
}

export function computeMerkleRoot(transactions) {
  if (!transactions || transactions.length === 0) return '';

  let hashes = transactions.map(tx => getHashCode(hashDigest(JSON.stringify(tx))));

  while (hashes.length > 1) {
    if (hashes.length % 2 !== 0) {
      hashes.push(hashes[hashes.length - 1]); 
    }

    const newLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const combined = hashes[i] + hashes[i + 1];
      const newHash = getHashCode(hashDigest(combined));
      newLevel.push(newHash);
    }
    hashes = newLevel;
  }

  return hashes[0]; 
}

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function stripPemHeaderFooter(pem) {
  return pem
    .replace(/-----BEGIN [\w\s]+-----/g, '')
    .replace(/-----END [\w\s]+-----/g, '')
    .replace(/\r?\n|\r/g, '');
}

export function getKeys() {
  return {
    privateKey: stripPemHeaderFooter(privateKey),
    publicKey: stripPemHeaderFooter(publicKey)
  };
}
  
  
  export function signTransaction(message, privateKeyPEM) {
    const hash = getHashCode(hashDigest(message));
    const bufferHash = Buffer.from(hash, "hex");
  
    const signature = crypto.sign("sha256", bufferHash, {
      key: privateKeyPEM,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });
  
    return signature.toString("hex");
  }
  
  export function verifyTransaction(message, signatureHex, publicKeyPEM) {
    const hash = getHashCode(hashDigest(message));
    const bufferHash = Buffer.from(hash, "hex");
    const signature = Buffer.from(signatureHex, "hex");
  
    return crypto.verify("sha256", bufferHash, {
      key: publicKeyPEM,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }, signature);
  }
  