export default function log(...args) {
  if (process.env.VERBOSE == '1') {
    console.log(...args);
  }
}
