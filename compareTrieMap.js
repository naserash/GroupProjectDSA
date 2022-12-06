const fs = require("fs");
const { performance } = require("perf_hooks");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const stream = fs.createReadStream("tracks.csv");
const reader = readline.createInterface({ input: stream });

const alphabetWithSpace = /^[a-zA-Z\s]*$/;
const data = [];

class TrieNode {
  constructor(key) {
    this.key = key;
    this.parent = null;
    this.children = {};
    this.end = false;
  }

  getWord() {
    let output = [];
    let node = this;

    while (node !== null) {
      output.unshift(node.key);
      node = node.parent;
    }

    return output.join("");
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode(null);
  }

  insert(word) {
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      if (!node.children[word[i]]) {
        node.children[word[i]] = new TrieNode(word[i]);
        node.children[word[i]].parent = node;
      }

      node = node.children[word[i]];

      if (i == word.length - 1) {
        node.end = true;
      }
    }
  }

  contains(word) {
    let node = this.root;

    for (const element of word) {
      if (node.children[element]) {
        node = node.children[element];
      } else {
        return false;
      }
    }
    return node.end;
  }

  findAllWords(node, arr) {
    if (node.end) {
      arr.unshift(node.getWord());
    }

    for (let child in node.children) {
      this.findAllWords(node.children[child], arr);
    }
  }

  find(prefix) {
    let node = this.root;
    let output = [];

    for (const element of prefix) {
      if (node.children[element]) {
        node = node.children[element];
      } else {
        return output;
      }
    }

    this.findAllWords(node, output);

    return output;
  }
}

// Inserting valid track name to data array
reader.on("line", (row) => {
  if (data.length == 100000) reader.close();

  if (alphabetWithSpace.test(row)) {
    data.push(row.toLowerCase());
  }
});

reader.on("close", () => {
  let isPlaying = true;
  let songTitle;
  const trie = new Trie();
  const map = new Map();

  data.forEach((trackName) => {
    trie.insert(trackName);
    map.set(trackName, true);
  });

  console.log("WELCOME TO GATOR MUSIC!");
  console.log("-----------------------");
  console.log("Please Enter the song title to check if we have it!");
  process.stdout.write("Song Title is: ");

  rl.on("line", (line) => {
    songTitle = line;
    rl.close();
  });

  rl.on("close", () => {
    console.log("");
    console.log("----------------------------------------------");
    console.log("Let's Check Trie Data Structure's Performance!");
    console.log("----------------------------------------------");

    let start = performance.now();

    if (trie.contains(songTitle)) {
      console.log(`Success: ${songTitle} is in our music library!`);
    } else {
      console.log(`Fail: ${songTitle} is not in our music library!`);
    }
    console.log(`It took ${performance.now() - start}ms to perform!`);
    console.log();

    start = performance.now();

    const trieContains = trie.find(songTitle);
    console.log(
      `There are ${trieContains.length} songs starting with ${songTitle}!`
    );
    console.log(`It took ${performance.now() - start}ms to perform!`);
    console.log();

    console.log("--------------------------------------------------");
    console.log("Now, Let's Check Map Data Structure's Performance!");
    console.log("--------------------------------------------------");

    start = performance.now();

    if (map.has(songTitle)) {
      console.log(`Success: ${songTitle} is in our music library!`);
    } else {
      console.log(`Fail: ${songTitle} is not in our music library!`);
    }
    console.log(`It took ${performance.now() - start}ms to perform!`);
    console.log();

    start = performance.now();

    const mapData = [];

    for (const song of map.keys()) {
      if (song.startsWith(songTitle)) mapData.push(song);
    }

    console.log(
      `There are ${mapData.length} songs starting with ${songTitle}!`
    );

    console.log(`It took ${performance.now() - start}ms to perform!`);
    console.log();
  });
});
