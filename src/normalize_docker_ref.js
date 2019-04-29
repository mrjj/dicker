const NormalizeDockerRef = ref => new Promise((resolve) => {
  process.stdout.write(`Normalization is currently disabled and ref will be returned as as: "${ref}"\n`);
  resolve(ref);
});

module.exports = NormalizeDockerRef;
