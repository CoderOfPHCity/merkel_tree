import crypto from "crypto";

const LEFT = "left";
const RIGHT = "right";

const hashes = [
    "0x77a03b7E9c0022936a5eA98A36288f6fe33767d3",
    "0x9F3dE0674D44D6368bfc8Ec4196D7Ff2BCf14e3A",
    "0x45D2Cc0F5f3Ecdad0Ba887eD3E1b9AB0b3E1b33C",
    "0xD891DcaA1Dc537611Efb0d66A1694610A969f74e",
    "0xaFD09F2f692C2f079363E4D7f4e6dA091Bd32863",
];

const sha256 = (data) => {
  return crypto.createHash("sha256").update(data).digest().toString("hex");
};

const getLeafNodeDirectionInMerkleTree = (hash, merkleTree) => {
  const hashIndex = merkleTree[0].findIndex((h) => h === hash);
  return hashIndex % 2 === 0 ? LEFT : RIGHT;
};


function ensureEven(hashes) {
  if (hashes.length % 2 !== 0) {
    hashes.push(hashes[hashes.length - 1]);
  }
}

function generateMerkleRoot(hashes) {
  if (!hashes || hashes.length == 0) {
    return "";
  }
  ensureEven(hashes);
  const combinedHashes = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const hashPairConcatenated = hashes[i] + hashes[i + 1];
    const hash = sha256(hashPairConcatenated);
    combinedHashes.push(hash);
  }
  // If the combinedHashes length is 1, it means that we have the merkle root already
  // and we can return
  if (combinedHashes.length === 1) {
    return combinedHashes.join("");
  }
  return generateMerkleRoot(combinedHashes);
}

function getMerkleRootFromMerkleProof(merkleProof) {
  if (!merkleProof || merkleProof.length === 0) {
    return "";
  }
  const merkleRootFromProof = merkleProof.reduce((hashProof1, hashProof2) => {
    if (hashProof2.direction === RIGHT) {
      const hash = sha256(hashProof1.hash + hashProof2.hash);
      return { hash };
    }
    const hash = sha256(hashProof2.hash + hashProof1.hash);
    return { hash };
  });
  return merkleRootFromProof.hash;
}


function generateMerkleTree(hashes) {
  if (!hashes || hashes.length === 0) {
    return [];
  }
  const tree = [hashes];
  const generate = (hashes, tree) => {
    if (hashes.length === 1) {
      return hashes;
    }
    ensureEven(hashes);
    const combinedHashes = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const hashesConcatenated = hashes[i] + hashes[i + 1];
      const hash = sha256(hashesConcatenated);
      combinedHashes.push(hash);
    }
    tree.push(combinedHashes);
    return generate(combinedHashes, tree);
  };
  generate(hashes, tree);
  return tree;
}


function generateMerkleProof(hash, hashes) {
  if (!hash || !hashes || hashes.length === 0) {
    return null;
  }
  const tree = generateMerkleTree(hashes);
  const merkleProof = [
    {
      hash,
      direction: getLeafNodeDirectionInMerkleTree(hash, tree),
    },
  ];
  let hashIndex = tree[0].findIndex((h) => h === hash);
  for (let level = 0; level < tree.length - 1; level++) {
    const isLeftChild = hashIndex % 2 === 0;
    const siblingDirection = isLeftChild ? RIGHT : LEFT;
    const siblingIndex = isLeftChild ? hashIndex + 1 : hashIndex - 1;
    const siblingNode = {
      hash: tree[level][siblingIndex],
      direction: siblingDirection,
    };
    merkleProof.push(siblingNode);
    hashIndex = Math.floor(hashIndex / 2);
  }
  return merkleProof;
}

const merkleRoot = generateMerkleRoot(hashes);

const generatedMerkleProof = generateMerkleProof(
  hashes[2],
  hashes
);

const merkleTree = generateMerkleTree(hashes);

const merkleRootFromMerkleProof =
  getMerkleRootFromMerkleProof(generatedMerkleProof);

console.log("merkleRoot: ", merkleRoot);
console.log("generatedMerkleProof: ", generatedMerkleProof);
console.log("merkleTree: ", merkleTree);
console.log("merkleRootFromMerkleProof: ", merkleRootFromMerkleProof);
console.log(
  "merkleRootFromMerkleProof === merkleRoot: ",
  merkleRootFromMerkleProof === merkleRoot
);